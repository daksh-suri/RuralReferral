import express from 'express';
import { body, validationResult } from 'express-validator';
import Referral from '../models/Referral.js';
import Hospital from '../models/Hospital.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { graph } from '../utils/hospitals.js';
import { calculateShortestPath } from '../utils/dijkstra.js';
import { calculateReferralScore } from '../utils/referralScoring.js';

const router = express.Router();

export const validateReferral = [
    body('patientAge')
        .isInt({ min: 0, max: 120 })
        .withMessage('patientAge must be an integer between 0 and 120'),
    body('urgency').isIn(['High', 'Medium', 'Low']).withMessage('urgency must be High, Medium, or Low'),
    body('symptoms').notEmpty().withMessage('symptoms are required'),
    body('vitals').notEmpty().withMessage('vitals are required')
];

// Shared helper: runs Dijkstra + scoring, returns best hospital info WITHOUT saving
async function computeBestHospital({ userLocation, urgency }) {
    if (!graph[userLocation]) return { error: 'Invalid location node', status: 400 };

    const distances = calculateShortestPath(graph, userLocation);
    const dbHospitals = await Hospital.find({});

    let bestHospital = null;
    let bestScore = -Infinity;
    let selectedTravelTime = 0;

    for (const hospital of dbHospitals) {
        if (hospital.availableCapacity === 0) continue;
        const rawTravelTime = distances[hospital.locationNode];
        if (!Number.isFinite(rawTravelTime)) return { error: 'Routing graph incomplete for this location', status: 500 };

        const score = calculateReferralScore({
            travelTime: rawTravelTime,
            availableCapacity: hospital.availableCapacity,
            totalCapacity: hospital.totalCapacity,
            loadFactor: hospital.loadFactor,
            urgency
        });

        if (score > bestScore) {
            bestScore = score;
            bestHospital = hospital;
            selectedTravelTime = rawTravelTime;
        }
    }

    if (!bestHospital) return { error: 'No available hospitals found', status: 400 };

    return {
        assignedHospital: bestHospital.name,
        score: Number(bestScore.toFixed(4)),
        travelTime: selectedTravelTime
    };
}

// POST /compute — returns optimal hospital recommendation WITHOUT saving to DB
router.post('/compute', authMiddleware, validateReferral, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

        const { urgency } = req.body;
        const result = await computeBestHospital({ userLocation: req.user.location, urgency });

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

        const { patientAge, symptoms, vitals, urgency, status, assignedHospital, score, travelTime } = req.body;

        const AUTO_ACCEPT_MS = process.env.AUTO_ACCEPT_MS || 5000;

        const referral = new Referral({
            userId: req.user.userId,
            patientAge: Number(patientAge),
            symptoms,
            vitals,
            urgency,
            assignedHospital,
            score: Number(Number(score).toFixed(4)),
            travelTime,
            status: status || 'Pending',
            autoAcceptAt: new Date(Date.now() + Number(AUTO_ACCEPT_MS))
        });

        await referral.save();

        res.status(201).json({
            referralId: referral._id,
            assignedHospital: referral.assignedHospital,
            score: referral.score,
            travelTime: referral.travelTime,
            status: referral.status
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
            createdAt: r.createdAt,
            acceptedAt: r.acceptedAt
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
