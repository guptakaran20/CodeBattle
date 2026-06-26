import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    password?: string;
    avatar?: string;
    provider: 'local' | 'google' | 'both';
    isGoogleVerified: boolean;
    role: 'USER' | 'ADMIN';
    rating: number;
    peakRating: number;
    rank: string;
    wins: number;
    losses: number;
    draws: number;
    battlesPlayed: number;
    bio?: string;
    college?: string;
    country?: string;
    isActive: boolean;
    refreshTokenVersion: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=user.model.d.ts.map