import mongoose, { Schema, Document, Types } from 'mongoose';
const problemSchema = new Schema({
    leetcodeId: { type: String, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    statementHtml: { type: String, required: true },
    examples: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
            explanation: { type: String },
        },
    ],
    constraints: [{ type: String }],
    tags: [{ type: String }],
    companies: [{ type: String }],
    starterCodes: [
        {
            language: { type: String, required: true },
            version: { type: String },
            code: { type: String, required: true },
        },
    ],
    functionMetadata: {
        functionName: { type: String },
        returnType: { type: String },
        parameters: { type: String },
        className: { type: String },
    },
    execution: {
        timeLimit: { type: Number, default: 2 },
        memoryLimit: { type: Number, default: 256 },
    },
    battle: {
        enabled: { type: Boolean, default: false },
        weight: { type: Number, default: 50 },
    },
    contest: {
        visible: { type: Boolean, default: false },
    },
    versions: {
        problemVersion: { type: Number, default: 1 },
        testSuiteVersion: { type: Number, default: 1 },
    },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
export const Problem = mongoose.model('Problem', problemSchema);
//# sourceMappingURL=problem.model.js.map