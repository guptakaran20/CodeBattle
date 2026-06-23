import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBattleEvent extends Document {
  battleId: Types.ObjectId;
  eventType:
    | 'BattleCreated'
    | 'PlayerJoined'
    | 'PlayerLeft'
    | 'BattleStarted'
    | 'SubmissionCreated'
    | 'SubmissionEvaluated'
    | 'WinnerDeclared'
    | 'BattleCompleted';
  payload: any;
  timestamp: Date;
}

const battleEventSchema = new Schema<IBattleEvent>(
  {
    battleId: { type: Schema.Types.ObjectId, ref: 'Battle', required: true },
    eventType: {
      type: String,
      enum: [
        'BattleCreated',
        'PlayerJoined',
        'PlayerLeft',
        'BattleStarted',
        'SubmissionCreated',
        'SubmissionEvaluated',
        'WinnerDeclared',
        'BattleCompleted',
      ],
      required: true,
    },
    payload: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const BattleEvent = mongoose.model<IBattleEvent>('BattleEvent', battleEventSchema);
