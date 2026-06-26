import mongoose, { Document, Types } from 'mongoose';
export interface ITournamentParticipant extends Document {
    tournamentId: Types.ObjectId;
    userId: Types.ObjectId;
    status: 'REGISTERED' | 'CHECKED_IN' | 'ELIMINATED' | 'ACTIVE';
    finalPosition?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TournamentParticipant: mongoose.Model<ITournamentParticipant, {}, {}, {}, mongoose.Document<unknown, {}, ITournamentParticipant, {}, mongoose.DefaultSchemaOptions> & ITournamentParticipant & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITournamentParticipant>;
//# sourceMappingURL=tournamentParticipant.model.d.ts.map