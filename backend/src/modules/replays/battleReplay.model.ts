import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBattleReplay extends Document {
  battleId: Types.ObjectId;
  winner?: Types.ObjectId;
  participants: Types.ObjectId[];
  duration: number; // in seconds
  totalSubmissions: number;
  startedAt: Date;
  endedAt: Date;
  finalStatus: string;
}

const battleReplaySchema = new Schema<IBattleReplay>({
  battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true, unique: true },
  winner: { type: Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  duration: { type: Number, required: true },
  totalSubmissions: { type: Number, default: 0 },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, required: true },
  finalStatus: { type: String, required: true }
}, { timestamps: true });

export const BattleReplay = mongoose.model<IBattleReplay>('BattleReplay', battleReplaySchema);
