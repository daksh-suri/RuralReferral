import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    clinicName: { type: String, required: true },
    location: { type: String, required: true },
    contact: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

export default mongoose.model('User', userSchema);
