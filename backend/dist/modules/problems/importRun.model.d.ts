import mongoose, { Document } from 'mongoose';
export interface IImportRun extends Document {
    startedAt: Date;
    finishedAt?: Date;
    easyImported: number;
    mediumImported: number;
    hardImported: number;
    published: number;
    draft: number;
    failed: number;
    duration?: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ImportRun: mongoose.Model<IImportRun, {}, {}, {}, mongoose.Document<unknown, {}, IImportRun, {}, mongoose.DefaultSchemaOptions> & IImportRun & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IImportRun>;
//# sourceMappingURL=importRun.model.d.ts.map