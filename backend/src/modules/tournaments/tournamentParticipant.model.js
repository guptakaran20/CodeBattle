import mongoose, { Schema, Document, Types } from 'mongoose';
const tournamentParticipantSchema = new Schema({
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['REGISTERED', 'CHECKED_IN', 'ELIMINATED', 'ACTIVE'],
        default: 'REGISTERED'
    },
    finalPosition: { type: Number }
}, { timestamps: true });
// Ensure a user can only register once per tournament
tournamentParticipantSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });
export const TournamentParticipant = mongoose.model('TournamentParticipant', tournamentParticipantSchema);
//# sourceMappingURL=tournamentParticipant.model.js.map