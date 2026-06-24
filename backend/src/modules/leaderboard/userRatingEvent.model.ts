import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUserRatingEvent extends Document {
  userId: Types.ObjectId;
  battleId?: Types.ObjectId;
  oldRating: number;
  newRating: number;
  delta: number;
  outcome: 'WIN' | 'LOSS' | 'DRAW' | 'TIMEOUT';
  createdAt: Date;
}

const UserRatingEventSchema = new Schema<IUserRatingEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle' },
    oldRating: { type: Number, required: true },
    newRating: { type: Number, required: true },
    delta: { type: Number, required: true },
    outcome: { type: String, enum: ['WIN', 'LOSS', 'DRAW', 'TIMEOUT'], required: true },
  },
  { timestamps: true }
);

export const UserRatingEvent = mongoose.model<IUserRatingEvent>('UserRatingEvent', UserRatingEventSchema);
