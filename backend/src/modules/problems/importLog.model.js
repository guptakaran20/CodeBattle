import mongoose, { Schema, Document } from 'mongoose';
const importLogSchema = new Schema({
    problemSlug: { type: String, required: true, index: true },
    importDate: { type: Date, required: true, default: Date.now },
    parserVersion: { type: Number, required: true, default: 1 },
    generatorVersion: { type: Number, required: true, default: 1 },
    validatorVersion: { type: Number, required: true, default: 1 },
    validationStatus: { type: String, enum: ['PASSED', 'FAILED', 'MANUAL_REVIEW'], required: true },
    validationTime: { type: Number, default: 0 },
    importErrors: [{ type: String }],
    rawSource: { type: Schema.Types.Mixed },
    aiLogs: { type: Schema.Types.Mixed },
}, { timestamps: true });
export const ImportLog = mongoose.model('ImportLog', importLogSchema);
//# sourceMappingURL=importLog.model.js.map