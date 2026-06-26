import mongoose, { Document, Types } from 'mongoose';
export interface IProblem extends Document {
    leetcodeId?: string;
    title: string;
    slug: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    statementHtml: string;
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];
    constraints: string[];
    tags: string[];
    companies: string[];
    starterCodes: {
        language: string;
        version: string;
        code: string;
    }[];
    functionMetadata?: {
        functionName: string;
        returnType: string;
        parameters: string;
        className?: string;
    };
    execution: {
        timeLimit: number;
        memoryLimit: number;
    };
    battle: {
        enabled: boolean;
        weight: number;
    };
    contest: {
        visible: boolean;
    };
    versions: {
        problemVersion: number;
        testSuiteVersion: number;
    };
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    createdBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Problem: mongoose.Model<IProblem, {}, {}, {}, mongoose.Document<unknown, {}, IProblem, {}, mongoose.DefaultSchemaOptions> & IProblem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProblem>;
//# sourceMappingURL=problem.model.d.ts.map