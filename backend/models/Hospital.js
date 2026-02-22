import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    locationNode: { type: String, required: true }, // Graph node string
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String },
    role: { type: String, default: 'hospital' },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    totalCapacity: { type: Number, required: true, default: 0 },
    availableCapacity: { type: Number, required: true, default: 0 },
    capacityRatio: { type: Number, required: true, default: 0 },
    loadFactor: { type: Number, required: true, default: 0 },
    specialties: [{ type: String }]
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
