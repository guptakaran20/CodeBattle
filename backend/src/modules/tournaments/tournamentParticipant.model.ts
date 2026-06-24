import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITournamentParticipant extends Document {
  tournamentId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'REGISTERED' | 'CHECKED_IN' | 'ELIMINATED' | 'ACTIVE';
  finalPosition?: number;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentParticipantSchema = new Schema<ITournamentParticipant>(
  {
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['REGISTERED', 'CHECKED_IN', 'ELIMINATED', 'ACTIVE'],
      default: 'REGISTERED'
    },
    finalPosition: { type: Number }
  },
  { timestamps: true }
);

// Ensure a user can only register once per tournament
tournamentParticipantSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });

export const TournamentParticipant = mongoose.model<ITournamentParticipant>('TournamentParticipant', tournamentParticipantSchema);
