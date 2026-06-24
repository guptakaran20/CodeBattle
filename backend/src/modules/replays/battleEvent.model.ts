import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBattleEvent extends Document {
  battleId: Types.ObjectId;
  sequenceNumber: number;
  eventType: string;
  payload: any;
  timestamp: Date;
}

const battleEventSchema = new Schema<IBattleEvent>({
  battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true, index: true },
  sequenceNumber: { type: Number, required: true },
  eventType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

// Ensure events are uniquely sequenced per battle
battleEventSchema.index({ battleId: 1, sequenceNumber: 1 }, { unique: true });

export const BattleEvent = mongoose.model<IBattleEvent>('BattleEvent', battleEventSchema);
