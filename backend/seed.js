import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Referral from './models/Referral.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rural-referral';

async function seedDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Referral.deleteMany({});
        console.log('Database cleared.');

        console.log('Creating Test Doctors...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const doc1 = new User({
            name: 'Dr. Sarah Connor',
            clinicName: 'Village A First Care',
            location: 'Village A',
            contact: '1111111111',
            password: hashedPassword
        });

        const doc2 = new User({
            name: 'Dr. John Smith',
            clinicName: 'Village B Family Clinic',
            location: 'Village B',
            contact: '2222222222',
            password: hashedPassword
        });

        await doc1.save();
        await doc2.save();
        console.log('Doctors created! (Logins: 1111111111 / password123 and 2222222222 / password123)');

        console.log('Creating Sample Referrals...');
        const ref1 = new Referral({
            userId: doc1._id,
            patientAge: 65,
            symptoms: 'Severe Chest Pain, Sweating',
            vitals: 'HR 120, BP 160/100',
            urgency: 'High',
            assignedHospital: 'City General Hospital',
            score: 1.2,
            travelTime: 45,
            status: 'Accepted'
        });

        const ref2 = new Referral({
            userId: doc2._id,
            patientAge: 12,
            symptoms: 'High Fever, Vomiting',
            vitals: 'Temp 103F',
            urgency: 'Medium',
            assignedHospital: 'North District',
            score: -28,
            travelTime: 40,
            status: 'Pending'
        });

        await ref1.save();
        await ref2.save();
        console.log('Referrals created!');

        console.log('Seeding COMPLETE! You can now start the server.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
