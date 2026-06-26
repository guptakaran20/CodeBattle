import mongoose, { Schema, Document, Types } from 'mongoose';
const battleEventSchema = new Schema({
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true, index: true },
    sequenceNumber: { type: Number, required: true },
    eventType: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now }
});
// Ensure events are uniquely sequenced per battle
battleEventSchema.index({ battleId: 1, sequenceNumber: 1 }, { unique: true });
export const BattleEvent = mongoose.model('BattleEvent', battleEventSchema);
//# sourceMappingURL=battleEvent.model.js.map