import mongoose, { Document, Types } from 'mongoose';
export interface IBattleEvent extends Document {
    battleId: Types.ObjectId;
    sequenceNumber: number;
    eventType: string;
    payload: any;
    timestamp: Date;
}
export declare const BattleEvent: mongoose.Model<IBattleEvent, {}, {}, {}, mongoose.Document<unknown, {}, IBattleEvent, {}, mongoose.DefaultSchemaOptions> & IBattleEvent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBattleEvent>;
//# sourceMappingURL=battleEvent.model.d.ts.map