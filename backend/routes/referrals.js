import express from 'express';
import { body, validationResult } from 'express-validator';
import Referral from '../models/Referral.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { hospitals, graph } from '../utils/hospitals.js';
import { calculateShortestPath } from '../utils/dijkstra.js';

const router = express.Router();

const getUrgencyLevel = (urgency) => {
    if (urgency === 'High') return 3;
    if (urgency === 'Medium') return 2;
    return 1;
};

const validateReferral = [
    body('patientAge').isNumeric().withMessage('patientAge must be a number'),
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
        const urgencyLevel = getUrgencyLevel(urgency);

        const userLocation = req.user.location;

        const distances = calculateShortestPath(graph, userLocation);

        let bestHospital = null;
        let bestScore = -Infinity;
        let selectedTravelTime = 0;

        for (const hospital of hospitals) {
            if (hospital.availableCapacity === 0) continue;

            const travelTime = distances[hospital.location] || 45;


            // Original Scoring Logic calculation 
            let rawScore = (5 * urgencyLevel) - (1 * travelTime) + (4 * hospital.capacityRatio) - (2 * hospital.loadFactor);

            // Defensive validation: ensure score is between 0 and 100
            const score = Math.max(0, Math.min(100, Math.round(rawScore)));

            if (score > bestScore) {
                bestScore = score;
                bestHospital = hospital;
                selectedTravelTime = travelTime;
            }
        }

        if (!bestHospital) {
            return res.status(400).json({ message: 'No available hospitals found' });
        }

        const referral = new Referral({
            userId: req.user.userId,
            patientAge,
            symptoms,
            vitals,
            urgency,
            assignedHospital: bestHospital.name,
            score: bestScore,
            travelTime: selectedTravelTime,
            status: 'Pending'
        });

        await referral.save();

        setTimeout(async () => {
            referral.status = 'Accepted';
            await referral.save();
        }, 5000);

        res.status(201).json({
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
        const referrals = await Referral.find({ userId: req.user.userId });

        const response = referrals.map(r => ({
            assignedHospital: r.assignedHospital,
            score: r.score,
            travelTime: r.travelTime,
            status: r.status
        }));

        res.json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
