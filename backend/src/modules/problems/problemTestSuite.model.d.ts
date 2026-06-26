import mongoose, { Document, Types } from 'mongoose';
export interface IProblemTestSuite extends Document {
    problemId: Types.ObjectId;
    version: number;
    checkerType: 'STANDARD' | 'SPECIAL' | 'CUSTOM';
    generatedAt: Date;
    cases: {
        input: string;
        expectedOutput: string;
        weight: number;
        isEdgeCase: boolean;
        group: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProblemTestSuite: mongoose.Model<IProblemTestSuite, {}, {}, {}, mongoose.Document<unknown, {}, IProblemTestSuite, {}, mongoose.DefaultSchemaOptions> & IProblemTestSuite & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProblemTestSuite>;
//# sourceMappingURL=problemTestSuite.model.d.ts.map