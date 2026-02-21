import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Referral from './models/Referral.js';
import Hospital from './models/Hospital.js';
import { hospitals } from './utils/hospitals.js';
import { calculatePriorityIndex } from './utils/priorityIndex.js';

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
        await Hospital.deleteMany({});
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
        const p1 = calculatePriorityIndex({ vitals: 'BP 160/100, HR 120', age: 65 });
        const p2 = calculatePriorityIndex({ vitals: 'Temp 103F', age: 12, symptomSeverity: 6 });

        const ref1 = new Referral({
            userId: doc1._id,
            patientAge: 65,
            symptoms: 'Severe Chest Pain, Sweating',
            vitals: 'HR 120, BP 160/100',
            urgency: 'High',
            assignedHospital: 'City General Hospital',
            score: 88,
            travelTime: 45,
            status: 'Accepted',
            autoAcceptAt: new Date(Date.now() - 10000),
            acceptedAt: new Date(Date.now() - 5000),
            priorityIndex: p1.priorityIndex,
            priorityLevel: p1.priorityLevel
        });

        const ref2 = new Referral({
            userId: doc2._id,
            patientAge: 12,
            symptoms: 'High Fever, Vomiting',
            vitals: 'Temp 103F',
            urgency: 'Medium',
            assignedHospital: 'Eastern Specialist',
            score: 67,
            travelTime: 25,
            status: 'Pending',
            autoAcceptAt: new Date(Date.now() + 60000),
            priorityIndex: p2.priorityIndex,
            priorityLevel: p2.priorityLevel
        });

        await ref1.save();
        await ref2.save();
        console.log('Referrals created!');

        console.log('Creating Hospitals from static list...');
        for (const hosp of hospitals) {
            const newHosp = new Hospital({
                name: hosp.name,
                locationNode: hosp.location,
                totalCapacity: hosp.totalCapacity,
                availableCapacity: hosp.availableCapacity,
                capacityRatio: hosp.capacityRatio,
                loadFactor: hosp.loadFactor,
                specialties: []
            });
            await newHosp.save();
        }
        console.log('Hospitals created!');

        console.log('Seeding COMPLETE! You can now start the server.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
