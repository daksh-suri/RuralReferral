import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientAge: { type: Number, required: true },
    symptoms: { type: String, required: true },
    vitals: { type: String, required: true },
    urgency: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
    assignedHospital: { type: String, required: true },
    score: { type: Number, required: true },
    travelTime: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' }
});

export default mongoose.model('Referral', referralSchema);
