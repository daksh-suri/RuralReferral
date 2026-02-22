import express from 'express';
import { body, validationResult } from 'express-validator';
import HospitalResource from '../models/HospitalResource.js';
import Referral from '../models/Referral.js';
import Hospital from '../models/Hospital.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { parseVitals } from '../utils/priorityIndex.js';

const router = express.Router();

// Middleware to ensure the user is a hospital
const hospitalMiddleware = (req, res, next) => {
    if (!req.user || !req.user.hospitalId) {
        return res.status(403).json({ message: 'Access denied: Hospital only' });
    }
    next();
};

export const validateResourceUpdate = [
    body('icuBeds').optional().isInt({ min: 0 }),
    body('beds').optional().isInt({ min: 0 }),
    body('oxygen').optional().isInt({ min: 0 }),
    body('ambulances').optional().isInt({ min: 0 })
];

router.put('/resources', authMiddleware, hospitalMiddleware, validateResourceUpdate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { icuBeds, beds, oxygen, ambulances } = req.body;
        const hospitalId = req.user.hospitalId;

        let resource = await HospitalResource.findOne({ hospitalId });
        if (resource) {
            if (icuBeds !== undefined) resource.icuBeds = icuBeds;
            if (beds !== undefined) resource.beds = beds;
            if (oxygen !== undefined) resource.oxygen = oxygen;
            if (ambulances !== undefined) resource.ambulances = ambulances;
            await resource.save();
        } else {
            resource = new HospitalResource({
                hospitalId,
                icuBeds: icuBeds || 0,
                beds: beds || 0,
                oxygen: oxygen || 0,
                ambulances: ambulances || 0
            });
            await resource.save();
        }

        res.json({ message: 'Resources updated successfully', resource });
    } catch (error) {
        console.error("Resource Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/resources', authMiddleware, hospitalMiddleware, async (req, res) => {
    try {
        const hospitalId = req.user.hospitalId;
        const resource = await HospitalResource.findOne({ hospitalId });
        if (!resource) {
            return res.json({ icuBeds: 0, beds: 0, oxygen: 0, ambulances: 0, lastUpdated: null });
        }
        res.json(resource);
    } catch (error) {
        console.error("Resource Fetch Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/referrals', authMiddleware, hospitalMiddleware, async (req, res) => {
    try {
        const hospitalId = req.user.hospitalId;
        const referrals = await Referral.find({ referredTo: hospitalId }).sort({ createdAt: -1 });
        res.json(referrals);
    } catch (error) {
        console.error("Hospital Referrals Fetch Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.patch('/referrals/:id', authMiddleware, hospitalMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const referral = await Referral.findOne({ _id: req.params.id, referredTo: req.user.hospitalId });
        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        referral.status = status;
        if (status === 'Accepted') {
            referral.acceptedAt = new Date();
        }
        await referral.save();

        res.json({ message: `Referral ${status.toLowerCase()} successfully`, referral });
    } catch (error) {
        console.error("Referral Update Error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
