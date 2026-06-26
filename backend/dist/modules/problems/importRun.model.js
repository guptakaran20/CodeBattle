import mongoose, { Schema, Document } from 'mongoose';
const importRunSchema = new Schema({
    startedAt: { type: Date, required: true, default: Date.now },
    finishedAt: { type: Date },
    easyImported: { type: Number, default: 0 },
    mediumImported: { type: Number, default: 0 },
    hardImported: { type: Number, default: 0 },
    published: { type: Number, default: 0 },
    draft: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    duration: { type: Number },
}, { timestamps: true });
export const ImportRun = mongoose.model('ImportRun', importRunSchema);
//# sourceMappingURL=importRun.model.js.map