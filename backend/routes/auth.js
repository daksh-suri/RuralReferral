import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

const validateSignup = [
    body('contact').notEmpty().withMessage('Contact is required').isLength({ min: 5 }).withMessage('Contact must be at least 5 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
    body('contact').notEmpty().withMessage('Contact is required').isLength({ min: 5 }).withMessage('Contact must be at least 5 characters'),
    body('password').notEmpty().withMessage('Password is required')
];

router.post('/signup', validateSignup, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, clinicName, location, contact, password } = req.body;
        let user = await User.findOne({ contact });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name, clinicName, location, contact, password: hashedPassword
        });
        await user.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

router.post('/login', validateLogin, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { contact, password } = req.body;
        const user = await User.findOne({ contact });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { userId: user._id, location: user.location };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'supersecretjwtkey', { expiresIn: '1d' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
