import mongoose, { Schema, Document, Types } from 'mongoose';
const battleEventSchema = new Schema({
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true },
    eventType: {
        type: String,
        enum: [
            'BattleCreated',
            'PlayerJoined',
            'PlayerLeft',
            'BattleStarted',
            'SubmissionCreated',
            'SubmissionEvaluated',
            'WinnerDeclared',
            'BattleCompleted',
        ],
        required: true,
    },
    payload: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: false });
export const BattleEvent = mongoose.model('BattleEvent', battleEventSchema);
//# sourceMappingURL=battleEvent.model.js.map