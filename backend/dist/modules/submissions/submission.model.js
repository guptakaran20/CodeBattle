import mongoose, { Schema, Document, Types } from 'mongoose';
const submissionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    battle: { type: Schema.Types.ObjectId, ref: 'Battle', required: true },
    problem: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, enum: ['CPP', 'JAVA', 'PYTHON'], required: true },
    code: { type: String, required: true },
    status: {
        type: String,
        enum: [
            'PENDING',
            'ACCEPTED',
            'WRONG_ANSWER',
            'TIME_LIMIT_EXCEEDED',
            'COMPILATION_ERROR',
            'RUNTIME_ERROR',
        ],
        default: 'PENDING',
    },
    judge0Token: { type: String },
    stdout: { type: String },
    stderr: { type: String },
    compileOutput: { type: String },
    verdictReason: { type: String },
    executionTime: { type: Number },
    memory: { type: Number },
    passedTests: { type: Number },
    totalTests: { type: Number },
    attemptNumber: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
}, { timestamps: false });
export const Submission = mongoose.model('Submission', submissionSchema);
//# sourceMappingURL=submission.model.js.map