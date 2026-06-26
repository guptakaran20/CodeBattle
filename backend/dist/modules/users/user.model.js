import mongoose, { Schema, Document } from 'mongoose';
const UserSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    avatar: { type: String },
    provider: { type: String, enum: ['local', 'google', 'both'], default: 'local' },
    isGoogleVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    rating: { type: Number, default: 1000 },
    peakRating: { type: Number, default: 1000 },
    rank: { type: String, default: 'Rookie' },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    battlesPlayed: { type: Number, default: 0 },
    bio: { type: String },
    college: { type: String },
    country: { type: String },
    isActive: { type: Boolean, default: true },
    refreshTokenVersion: { type: Number, default: 0 },
}, { timestamps: true });
export const User = mongoose.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map