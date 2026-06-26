import mongoose, { Document, Types } from 'mongoose';
export interface IProblem extends Document {
    title: string;
    slug: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    tags: string[];
    constraints: string[];
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];
    starterCode: {
        CPP?: string;
        JAVA?: string;
        PYTHON?: string;
    };
    testcases: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[];
    source: 'ORIGINAL' | 'AI_GENERATED';
    isPublished: boolean;
    createdBy: Types.ObjectId;
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