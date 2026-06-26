import mongoose, { Document, Types } from 'mongoose';
export interface ITournamentMatch extends Document {
    tournamentId: Types.ObjectId;
    round: number;
    matchIndex: number;
    battleId?: Types.ObjectId;
    player1?: Types.ObjectId;
    player2?: Types.ObjectId;
    winner?: Types.ObjectId;
    nextMatchId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TournamentMatch: mongoose.Model<ITournamentMatch, {}, {}, {}, mongoose.Document<unknown, {}, ITournamentMatch, {}, mongoose.DefaultSchemaOptions> & ITournamentMatch & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITournamentMatch>;
//# sourceMappingURL=tournamentMatch.model.d.ts.map