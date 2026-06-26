import mongoose, { Document, Types } from 'mongoose';
export interface IBattle extends Document {
    battleCode: string;
    creator: Types.ObjectId;
    teams: {
        teamId: string;
        members: Types.ObjectId[];
    }[];
    battleType: 'ONE_VS_ONE' | 'TWO_VS_TWO' | 'FOUR_VS_FOUR' | 'TOURNAMENT';
    battleMode: 'COMPETITIVE' | 'PRACTICE';
    maxParticipants: number;
    problem: Types.ObjectId;
    durationMinutes: number;
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    settings: {
        visibility: 'PUBLIC' | 'PRIVATE';
        allowSpectators: boolean;
        aiReviewEnabled: boolean;
    };
    winCondition: 'FIRST_ACCEPTED' | 'MOST_TESTS' | 'POINTS';
    winner?: Types.ObjectId;
    result?: {
        winningTeamId?: string;
        winReason?: 'FIRST_ACCEPTED' | 'MOST_TESTS' | 'TIMEOUT' | 'MANUAL';
    };
    tournamentId?: Types.ObjectId;
    tournamentMatchId?: Types.ObjectId;
    startTime?: Date;
    endTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Battle: mongoose.Model<IBattle, {}, {}, {}, mongoose.Document<unknown, {}, IBattle, {}, mongoose.DefaultSchemaOptions> & IBattle & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBattle>;
//# sourceMappingURL=battle.model.d.ts.map