import mongoose, { Schema, Document, Types } from 'mongoose';
const battleSchema = new Schema({
    battleCode: { type: String, required: true, unique: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teams: [
        {
            teamId: { type: String, required: true },
            members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
    ],
    battleType: {
        type: String,
        enum: ['ONE_VS_ONE', 'TWO_VS_TWO', 'FOUR_VS_FOUR', 'TOURNAMENT'],
        required: true,
    },
    battleMode: { type: String, enum: ['COMPETITIVE', 'PRACTICE'], required: true },
    maxParticipants: { type: Number, required: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    durationMinutes: { type: Number, required: true },
    status: {
        type: String,
        enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'WAITING',
    },
    settings: {
        visibility: { type: String, enum: ['PUBLIC', 'PRIVATE'], default: 'PUBLIC' },
        allowSpectators: { type: Boolean, default: false },
        aiReviewEnabled: { type: Boolean, default: true },
    },
    winCondition: {
        type: String,
        enum: ['FIRST_ACCEPTED', 'MOST_TESTS', 'POINTS'],
        default: 'FIRST_ACCEPTED'
    },
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    result: {
        winningTeamId: { type: String },
        winReason: {
            type: String,
            enum: ['FIRST_ACCEPTED', 'MOST_TESTS', 'TIMEOUT', 'MANUAL'],
        },
    },
    startTime: { type: Date },
    endTime: { type: Date },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament' },
    tournamentMatchId: { type: Schema.Types.ObjectId, ref: 'TournamentMatch' }
}, { timestamps: true });
export const Battle = mongoose.model('Battle', battleSchema);
//# sourceMappingURL=battle.model.js.map