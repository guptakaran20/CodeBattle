import mongoose, { Document, Types } from 'mongoose';
export interface IUserRatingEvent extends Document {
    userId: Types.ObjectId;
    battleId?: Types.ObjectId;
    oldRating: number;
    newRating: number;
    delta: number;
    outcome: 'WIN' | 'LOSS' | 'DRAW' | 'TIMEOUT';
    createdAt: Date;
}
export declare const UserRatingEvent: mongoose.Model<IUserRatingEvent, {}, {}, {}, mongoose.Document<unknown, {}, IUserRatingEvent, {}, mongoose.DefaultSchemaOptions> & IUserRatingEvent & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserRatingEvent>;
//# sourceMappingURL=userRatingEvent.model.d.ts.map