import express from 'express';
import { body, validationResult } from 'express-validator';
import Referral from '../models/Referral.js';
import Hospital from '../models/Hospital.js';
import HospitalResource from '../models/HospitalResource.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { graph } from '../utils/hospitals.js';
import { calculateShortestPath } from '../utils/dijkstra.js';
import { calculateReferralScore } from '../utils/referralScoring.js';
import { calculatePriorityIndex, parseVitals } from '../utils/priorityIndex.js';

const router = express.Router();

export const validateReferral = [
    body('patientAge')
        .isInt({ min: 0, max: 120 })
        .withMessage('patientAge must be an integer between 0 and 120'),
    body('urgency').isIn(['High', 'Medium', 'Low']).withMessage('urgency must be High, Medium, or Low'),
    body('symptoms').notEmpty().withMessage('symptoms are required'),
    body('vitals').notEmpty().withMessage('vitals are required'),
    body('trauma').optional().isBoolean(),
    body('symptomSeverity').optional().isInt({ min: 1, max: 10 }),
    body('conscious').optional().isBoolean()
];

// Shared helper: runs Dijkstra + scoring, returns best hospital info WITHOUT saving
async function computeBestHospital({ userLocation, urgency, vitals, trauma, conscious }) {
    if (!graph[userLocation]) return { error: 'Invalid location node', status: 400 };

    const distances = calculateShortestPath(graph, userLocation);
    const dbHospitals = await Hospital.find({});

    const parsedVitals = parseVitals(vitals || '');
    const needsOxygen = parsedVitals.oxygenLevel !== null && parsedVitals.oxygenLevel < 90;
    const needsIcu = urgency === 'High' || conscious === false;
    const needsAmbulance = urgency === 'High' || trauma === true;

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeResources = await HospitalResource.find({
        lastUpdated: { $gte: thirtyMinsAgo }
    });

    const resourceMap = {};
    for (const res of activeResources) {
        resourceMap[res.hospitalId.toString()] = res;
    }

    let bestHospital = null;
    let bestScore = -Infinity;
    let selectedTravelTime = 0;
    let bestHospitalId = null;

    for (const hospital of dbHospitals) {
        const hRes = resourceMap[hospital._id.toString()];
        if (!hRes) continue; // Skip hospitals without active resources

        if (needsOxygen && hRes.oxygen <= 0) continue;
        if (needsIcu && hRes.icuBeds <= 0) continue;
        if (needsAmbulance && hRes.ambulances <= 0) continue;
        if (hRes.beds <= 0) continue;

        const rawTravelTime = distances[hospital.locationNode];
        if (rawTravelTime === undefined || rawTravelTime === null) continue;
        if (!Number.isFinite(rawTravelTime)) continue;

        const availableCapacity = hRes.beds + hRes.icuBeds;
        const totalCapacity = hospital.totalCapacity > 0 ? hospital.totalCapacity : availableCapacity;
        const loadFactor = totalCapacity > 0 ? (totalCapacity - availableCapacity) / totalCapacity : 1;

        const score = calculateReferralScore({
            travelTime: rawTravelTime,
            availableCapacity: availableCapacity,
            totalCapacity: totalCapacity,
            loadFactor: loadFactor,
            urgency
        });

        if (score > bestScore) {
            bestScore = score;
            bestHospital = hospital;
            bestHospitalId = hospital._id;
            selectedTravelTime = rawTravelTime;
        }
    }

    if (!bestHospital) return { error: 'No available hospitals with required resources found', status: 400 };

    return {
        assignedHospital: bestHospital.name,
        referredTo: bestHospitalId,
        score: Number(bestScore.toFixed(4)),
        travelTime: selectedTravelTime
    };
}

// POST /compute — returns optimal hospital recommendation WITHOUT saving to DB
router.post('/compute', authMiddleware, validateReferral, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

        const { urgency, vitals, trauma, conscious } = req.body;
        const result = await computeBestHospital({ userLocation: req.user.location, urgency, vitals, trauma, conscious });

        if (result.error) return res.status(result.status).json({ error: result.error });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST / — saves referral to DB. Called only when doctor commits to an action.
router.post('/', authMiddleware, validateReferral, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

        const { patientAge, symptoms, vitals, urgency, status, assignedHospital, referredTo, score, travelTime, trauma, symptomSeverity, conscious } = req.body;

        const AUTO_ACCEPT_MS = process.env.AUTO_ACCEPT_MS || 5000;

        // Parse travelTime: accept number or string like "45 mins"
        if (travelTime === undefined || travelTime === null) {
            return res.status(400).json({ message: "travelTime is required from routing engine" });
        }
        const travelTimeNum = typeof travelTime === 'number' && !isNaN(travelTime)
            ? travelTime
            : parseInt(String(travelTime).replace(/\D/g, ''), 10);

        if (isNaN(travelTimeNum)) {
            return res.status(400).json({ message: "Invalid travelTime format or missing travel time" });
        }

        // Map frontend statuses to schema enum: Escalated -> Pending; Closed Local -> Accepted
        const schemaStatus = (status === 'Escalated')
            ? 'Pending'
            : (status && status.startsWith('Closed Local'))
                ? 'Accepted'
                : (['Pending', 'Accepted'].includes(status) ? status : 'Pending');

        // Priority Index: isolated classification layer, patient condition only (no routing/capacity)
        let priorityIndex, priorityLevel;
        try {
            const result = calculatePriorityIndex({
                vitals,
                age: patientAge,
                symptomSeverity,
                urgency,
                trauma,
                conscious
            });
            priorityIndex = result.priorityIndex;
            priorityLevel = result.priorityLevel;
        } catch (priorityErr) {
            return res.status(400).json({ message: priorityErr.message || 'Invalid priority input data' });
        }

        const referral = new Referral({
            userId: req.user.userId,
            patientAge: Number(patientAge),
            symptoms,
            vitals,
            urgency,
            assignedHospital,
            referredTo,
            score: Number(Number(score).toFixed(4)),
            travelTime: travelTimeNum,
            status: schemaStatus,
            autoAcceptAt: new Date(Date.now() + Number(AUTO_ACCEPT_MS)),
            priorityIndex,
            priorityLevel
        });

        await referral.save();

        res.status(201).json({
            referralId: referral._id,
            assignedHospital: referral.assignedHospital,
            score: referral.score,
            travelTime: referral.travelTime,
            status: referral.status,
            priorityIndex: referral.priorityIndex,
            priorityLevel: referral.priorityLevel
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const referrals = await Referral.find({ userId: req.user.userId }).sort({ createdAt: -1 });

        const response = referrals.map(r => ({
            id: r._id,
            assignedHospital: r.assignedHospital,
            score: r.score,
            travelTime: r.travelTime,
            status: r.status,
            urgency: r.urgency,
            priorityIndex: r.priorityIndex,
            priorityLevel: r.priorityLevel,
            createdAt: r.createdAt,
            acceptedAt: r.acceptedAt
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
