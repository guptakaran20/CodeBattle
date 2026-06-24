import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITournament extends Document {
  title: string;
  description?: string;
  status: 'DRAFT' | 'REGISTRATION' | 'CHECK_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  format: 'SINGLE_ELIMINATION';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  battleDuration: number; // in minutes
  startTime?: Date;
  maxParticipants: number;
  currentRound: number;
  prizePool?: string;
  createdBy: Types.ObjectId;
  winner?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentSchema = new Schema<ITournament>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['DRAFT', 'REGISTRATION', 'CHECK_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT'
    },
    format: { type: String, enum: ['SINGLE_ELIMINATION'], default: 'SINGLE_ELIMINATION' },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
    battleDuration: { type: Number, required: true, default: 15 },
    startTime: { type: Date },
    maxParticipants: { type: Number, required: true, enum: [4, 8, 16, 32] },
    currentRound: { type: Number, default: 0 },
    prizePool: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    winner: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Tournament = mongoose.model<ITournament>('Tournament', tournamentSchema);
