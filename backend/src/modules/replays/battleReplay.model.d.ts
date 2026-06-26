import mongoose, { Document, Types } from 'mongoose';
export interface IBattleReplay extends Document {
    battleId: Types.ObjectId;
    winner?: Types.ObjectId;
    participants: Types.ObjectId[];
    duration: number;
    totalSubmissions: number;
    startedAt: Date;
    endedAt: Date;
    finalStatus: string;
    ratingDeltas?: Array<{
        userId: Types.ObjectId;
        ratingBefore: number;
        ratingAfter: number;
        delta: number;
    }>;
}
export declare const BattleReplay: mongoose.Model<IBattleReplay, {}, {}, {}, mongoose.Document<unknown, {}, IBattleReplay, {}, mongoose.DefaultSchemaOptions> & IBattleReplay & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBattleReplay>;
//# sourceMappingURL=battleReplay.model.d.ts.map