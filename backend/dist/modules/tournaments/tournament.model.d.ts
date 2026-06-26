import mongoose, { Document, Types } from 'mongoose';
import { TournamentStatus, TournamentDifficulty } from '../../constants/tournament.js';
export interface ITournament extends Document {
    title: string;
    slug: string;
    shortId: string;
    description?: string;
    status: TournamentStatus;
    format: 'SINGLE_ELIMINATION';
    difficulty: TournamentDifficulty;
    battleDuration: number;
    startTime?: Date;
    maxParticipants: number;
    currentParticipantsCount: number;
    currentRound: number;
    prizePool?: string;
    createdBy: Types.ObjectId;
    winner?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
export declare const Tournament: mongoose.Model<ITournament, {}, {}, {}, mongoose.Document<unknown, {}, ITournament, {}, mongoose.DefaultSchemaOptions> & ITournament & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITournament>;
//# sourceMappingURL=tournament.model.d.ts.map