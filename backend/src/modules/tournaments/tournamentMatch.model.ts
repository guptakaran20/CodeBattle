import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITournamentMatch extends Document {
  tournamentId: Types.ObjectId;
  round: number; // 1 = First Round, 2 = Next Round, etc.
  matchIndex: number; // Ordering within the round
  battleId?: Types.ObjectId; // The actual battle once spawned
  player1?: Types.ObjectId;
  player2?: Types.ObjectId;
  winner?: Types.ObjectId;
  nextMatchId?: Types.ObjectId; // Pointer to the parent node in the binary tree
  createdAt: Date;
  updatedAt: Date;
}

const tournamentMatchSchema = new Schema<ITournamentMatch>(
  {
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    round: { type: Number, required: true },
    matchIndex: { type: Number, required: true },
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle' },
    player1: { type: Schema.Types.ObjectId, ref: 'User' },
    player2: { type: Schema.Types.ObjectId, ref: 'User' },
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    nextMatchId: { type: Schema.Types.ObjectId, ref: 'TournamentMatch' }
  },
  { timestamps: true }
);

// Ensure index uniqueness per bracket node
tournamentMatchSchema.index({ tournamentId: 1, round: 1, matchIndex: 1 }, { unique: true });

export const TournamentMatch = mongoose.model<ITournamentMatch>('TournamentMatch', tournamentMatchSchema);
