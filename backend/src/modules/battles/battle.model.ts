import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBattle extends Document {
  battleCode: string;
  creator: Types.ObjectId;
  teams: {
    teamId: string;
    members: Types.ObjectId[];
  }[];
  battleType: 'ONE_VS_ONE' | 'TWO_VS_TWO' | 'FOUR_VS_FOUR' | 'TOURNAMENT';
  battleMode: 'COMPETITIVE' | 'PRACTICE';
  maxParticipants: number;
  problem: Types.ObjectId;
  durationMinutes: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  settings: {
    visibility: 'PUBLIC' | 'PRIVATE';
    allowSpectators: boolean;
    aiReviewEnabled: boolean;
  };
  result?: {
    winningTeamId?: string;
    winReason?: 'FIRST_ACCEPTED' | 'MOST_TESTS' | 'TIMEOUT' | 'MANUAL';
  };
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const battleSchema = new Schema<IBattle>(
  {
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
    result: {
      winningTeamId: { type: String },
      winReason: {
        type: String,
        enum: ['FIRST_ACCEPTED', 'MOST_TESTS', 'TIMEOUT', 'MANUAL'],
      },
    },
    startTime: { type: Date },
    endTime: { type: Date },
  },
  { timestamps: true }
);

export const Battle = mongoose.model<IBattle>('Battle', battleSchema);
