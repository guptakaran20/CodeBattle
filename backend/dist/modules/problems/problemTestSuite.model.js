import mongoose, { Schema, Document, Types } from 'mongoose';
const problemTestSuiteSchema = new Schema({
    problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true, index: true },
    version: { type: Number, required: true, default: 1 },
    checkerType: { type: String, enum: ['STANDARD', 'SPECIAL', 'CUSTOM'], default: 'STANDARD' },
    generatedAt: { type: Date, required: true },
    cases: [
        {
            input: { type: String, required: true },
            expectedOutput: { type: String, required: true },
            weight: { type: Number, default: 1 },
            isEdgeCase: { type: Boolean, default: false },
            group: { type: String, default: 'basic' },
        },
    ],
}, { timestamps: true });
export const ProblemTestSuite = mongoose.model('ProblemTestSuite', problemTestSuiteSchema);
//# sourceMappingURL=problemTestSuite.model.js.map