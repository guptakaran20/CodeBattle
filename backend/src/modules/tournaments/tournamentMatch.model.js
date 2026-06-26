import mongoose, { Schema, Document, Types } from 'mongoose';
const tournamentMatchSchema = new Schema({
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    round: { type: Number, required: true },
    matchIndex: { type: Number, required: true },
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle' },
    player1: { type: Schema.Types.ObjectId, ref: 'User' },
    player2: { type: Schema.Types.ObjectId, ref: 'User' },
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    nextMatchId: { type: Schema.Types.ObjectId, ref: 'TournamentMatch' }
}, { timestamps: true });
// Ensure index uniqueness per bracket node
tournamentMatchSchema.index({ tournamentId: 1, round: 1, matchIndex: 1 }, { unique: true });
export const TournamentMatch = mongoose.model('TournamentMatch', tournamentMatchSchema);
//# sourceMappingURL=tournamentMatch.model.js.map