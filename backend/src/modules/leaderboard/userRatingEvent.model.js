import mongoose, { Schema, Document, Types } from 'mongoose';
const UserRatingEventSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle' },
    oldRating: { type: Number, required: true },
    newRating: { type: Number, required: true },
    delta: { type: Number, required: true },
    outcome: { type: String, enum: ['WIN', 'LOSS', 'DRAW', 'TIMEOUT'], required: true },
}, { timestamps: true });
export const UserRatingEvent = mongoose.model('UserRatingEvent', UserRatingEventSchema);
//# sourceMappingURL=userRatingEvent.model.js.map