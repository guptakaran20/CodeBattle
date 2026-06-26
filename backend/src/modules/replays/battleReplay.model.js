import mongoose, { Schema, Document, Types } from 'mongoose';
const battleReplaySchema = new Schema({
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true, unique: true },
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    duration: { type: Number, required: true },
    totalSubmissions: { type: Number, default: 0 },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    finalStatus: { type: String, required: true },
    ratingDeltas: [{
            userId: { type: Schema.Types.ObjectId, ref: 'User' },
            ratingBefore: Number,
            ratingAfter: Number,
            delta: Number
        }]
}, { timestamps: true });
export const BattleReplay = mongoose.model('BattleReplay', battleReplaySchema);
//# sourceMappingURL=battleReplay.model.js.map