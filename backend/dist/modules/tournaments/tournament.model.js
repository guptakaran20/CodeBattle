import mongoose, { Schema, Document, Types } from 'mongoose';
import { TournamentStatus, TournamentDifficulty } from '../../constants/tournament.js';
const tournamentSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    shortId: { type: String, required: true, unique: true },
    description: { type: String },
    status: {
        type: String,
        enum: Object.values(TournamentStatus),
        default: TournamentStatus.DRAFT
    },
    format: { type: String, enum: ['SINGLE_ELIMINATION'], default: 'SINGLE_ELIMINATION' },
    difficulty: { type: String, enum: Object.values(TournamentDifficulty), default: TournamentDifficulty.MEDIUM },
    battleDuration: { type: Number, required: true, default: 15 },
    startTime: { type: Date },
    maxParticipants: { type: Number, required: true, enum: [2, 4, 8, 16, 32, 64, 128] },
    currentParticipantsCount: { type: Number, default: 0 },
    currentRound: { type: Number, default: 0 },
    prizePool: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    winner: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version'
});
export const Tournament = mongoose.model('Tournament', tournamentSchema);
//# sourceMappingURL=tournament.model.js.map