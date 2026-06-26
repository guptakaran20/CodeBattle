import mongoose, { Schema, Document, Types } from 'mongoose';
const problemSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    tags: [{ type: String }],
    constraints: [{ type: String }],
    examples: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
            explanation: { type: String },
        },
    ],
    starterCode: {
        CPP: { type: String },
        JAVA: { type: String },
        PYTHON: { type: String },
    },
    testcases: [
        {
            input: { type: String, required: true },
            expectedOutput: { type: String, required: true },
            isHidden: { type: Boolean, default: false },
        },
    ],
    source: { type: String, enum: ['ORIGINAL', 'AI_GENERATED'], default: 'ORIGINAL' },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
export const Problem = mongoose.model('Problem', problemSchema);
//# sourceMappingURL=problem.model.js.map