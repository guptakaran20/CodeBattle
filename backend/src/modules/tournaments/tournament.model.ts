import mongoose, { Schema, Document, Types } from 'mongoose';
import { TournamentStatus, TournamentDifficulty } from '../../constants/tournament.js';

export interface ITournament extends Document {
  title: string;
  slug: string;
  shortId: string;
  description?: string;
  status: TournamentStatus;
  format: 'SINGLE_ELIMINATION';
  difficulty: TournamentDifficulty;
  battleDuration: number; // in minutes
  startTime?: Date;
  maxParticipants: number;
  currentParticipantsCount: number;
  currentRound: number;
  prizePool?: string;
  createdBy: Types.ObjectId;
  winner?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  version: number; // for optimistic concurrency
}

const tournamentSchema = new Schema<ITournament>(
  {
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
  },
  { 
    timestamps: true,
    optimisticConcurrency: true,
    versionKey: 'version' 
  }
);

export const Tournament = mongoose.model<ITournament>('Tournament', tournamentSchema);
