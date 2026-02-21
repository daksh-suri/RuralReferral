import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    locationNode: { type: String, required: true },
    totalCapacity: { type: Number, required: true },
    availableCapacity: { type: Number, required: true },
    capacityRatio: { type: Number, required: true },
    loadFactor: { type: Number, required: true },
    specialties: [{ type: String }]
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
