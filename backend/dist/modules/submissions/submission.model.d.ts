import mongoose, { Document, Types } from 'mongoose';
export interface ISubmission extends Document {
    user: Types.ObjectId;
    battle: Types.ObjectId;
    problem: Types.ObjectId;
    language: 'CPP' | 'JAVA' | 'PYTHON';
    code: string;
    status: 'PENDING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR';
    judge0Token?: string;
    stdout?: string;
    stderr?: string;
    compileOutput?: string;
    verdictReason?: string;
    executionTime?: number;
    memory?: number;
    passedTests?: number;
    totalTests?: number;
    attemptNumber: number;
    submittedAt: Date;
}
export declare const Submission: mongoose.Model<ISubmission, {}, {}, {}, mongoose.Document<unknown, {}, ISubmission, {}, mongoose.DefaultSchemaOptions> & ISubmission & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubmission>;
//# sourceMappingURL=submission.model.d.ts.map