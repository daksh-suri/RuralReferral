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
    status: { type: String, enum: ['Pending', 'Accepted'], default: 'Pending' },
    autoAcceptAt: { type: Date, required: true },
    acceptedAt: { type: Date }
}, { timestamps: true });

referralSchema.index({ status: 1, autoAcceptAt: 1 });

export default mongoose.model('Referral', referralSchema);
