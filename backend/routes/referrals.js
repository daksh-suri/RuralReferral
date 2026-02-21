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

router.post('/', authMiddleware, validateReferral, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { patientAge, symptoms, vitals, urgency } = req.body;

        const userLocation = req.user.location;

        if (!graph[userLocation]) {
            return res.status(400).json({ error: "Invalid location node" });
        }

        const distances = calculateShortestPath(graph, userLocation);
        const dbHospitals = await Hospital.find({});

        let bestHospital = null;
        let bestScore = -Infinity;
        let selectedTravelTime = 0;

        for (const hospital of dbHospitals) {
            if (hospital.availableCapacity === 0) continue;

            const rawTravelTime = distances[hospital.locationNode];
            if (!Number.isFinite(rawTravelTime)) {
                return res.status(500).json({ error: "Routing graph incomplete for this location" });
            }

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

        if (!bestHospital) {
            return res.status(400).json({ message: 'No available hospitals found' });
        }

        const AUTO_ACCEPT_MS = process.env.AUTO_ACCEPT_MS || 5000;

        const referral = new Referral({
            userId: req.user.userId,
            patientAge: Number(patientAge),
            symptoms,
            vitals,
            urgency,
            assignedHospital: bestHospital.name,
            score: bestScore,
            travelTime: selectedTravelTime,
            status: 'Pending',
            autoAcceptAt: new Date(Date.now() + Number(AUTO_ACCEPT_MS))
        });

        await referral.save();

        res.status(201).json({
            referralId: referral._id,
            assignedHospital: bestHospital.name,
            score: bestScore,
            travelTime: selectedTravelTime,
            status: 'Pending'
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
