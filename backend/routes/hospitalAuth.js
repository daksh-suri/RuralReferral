import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Hospital from '../models/Hospital.js';

const router = express.Router();

export const validateHospitalSignup = [
    body('name').trim().notEmpty().withMessage('Hospital name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

export const validateHospitalLogin = [
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post('/signup', validateHospitalSignup, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, email, password, locationNode, lat, lng } = req.body;

        let hospital = await Hospital.findOne({ email });
        if (hospital) return res.status(400).json({ message: 'Hospital already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        hospital = new Hospital({
            name,
            email,
            passwordHash,
            role: 'hospital',
            locationNode: locationNode || 'City Center', // default for routing compatibility
            location: {
                lat: lat || 0,
                lng: lng || 0
            },
            totalCapacity: 0,
            availableCapacity: 0,
            capacityRatio: 0,
            loadFactor: 0
        });

        await hospital.save();

        res.status(201).json({ message: 'Hospital created successfully' });
    } catch (error) {
        console.error("Hospital Signup error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/login', validateHospitalLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { email, password } = req.body;
        const hospital = await Hospital.findOne({ email });
        if (!hospital || !hospital.passwordHash) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, hospital.passwordHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { hospitalId: hospital._id, role: hospital.role };
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET missing");
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, hospital: { id: hospital._id, name: hospital.name, role: hospital.role } });
    } catch (error) {
        console.error("Hospital Login error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
