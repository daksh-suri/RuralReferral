import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from './models/Hospital.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const hospitals = await Hospital.find({ email: { $exists: true, $ne: null } });
        console.log(`Found ${hospitals.length} hospitals with an email:`);
        hospitals.forEach(h => {
            console.log(`- Name: ${h.name}, Email: ${h.email}, Role: ${h.role}`);
        });
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Connection error', err);
    });
