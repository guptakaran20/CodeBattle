import mongoose, { Document } from 'mongoose';
export interface IImportLog extends Document {
    problemSlug: string;
    importDate: Date;
    parserVersion: number;
    generatorVersion: number;
    validatorVersion: number;
    validationStatus: 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
    validationTime: number;
    importErrors: string[];
    rawSource: mongoose.Schema.Types.Mixed;
    aiLogs: mongoose.Schema.Types.Mixed;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ImportLog: mongoose.Model<IImportLog, {}, {}, {}, mongoose.Document<unknown, {}, IImportLog, {}, mongoose.DefaultSchemaOptions> & IImportLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IImportLog>;
//# sourceMappingURL=importLog.model.d.ts.map