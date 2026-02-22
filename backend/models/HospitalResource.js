import mongoose from 'mongoose';

const hospitalResourceSchema = new mongoose.Schema({
    hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true, unique: true },
    icuBeds: { type: Number, default: 0 },
    beds: { type: Number, default: 0 },
    oxygen: { type: Number, default: 0 },
    ambulances: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-update lastUpdated before save/update
hospitalResourceSchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    next();
});

hospitalResourceSchema.pre('findOneAndUpdate', function (next) {
    this.set({ lastUpdated: new Date() });
    next();
});

const HospitalResource = mongoose.model('HospitalResource', hospitalResourceSchema);

export default HospitalResource;
