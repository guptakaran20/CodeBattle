import mongoose, { Schema, Document } from 'mongoose';

export interface IImportLog extends Document {
  problemSlug: string;
  importDate: Date;
  
  // Versions used during this specific import
  parserVersion: number;
  generatorVersion: number;
  validatorVersion: number;
  
  validationStatus: 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
  validationTime: number; // in milliseconds
  errors: string[];
  
  rawSource: mongoose.Schema.Types.Mixed; // The full API JSON response
  aiLogs: mongoose.Schema.Types.Mixed; // Any AI generation metadata
  createdAt: Date;
  updatedAt: Date;
}

const importLogSchema = new Schema<IImportLog>(
  {
    problemSlug: { type: String, required: true, index: true },
    importDate: { type: Date, required: true, default: Date.now },
    
    parserVersion: { type: Number, required: true, default: 1 },
    generatorVersion: { type: Number, required: true, default: 1 },
    validatorVersion: { type: Number, required: true, default: 1 },
    
    validationStatus: { type: String, enum: ['PASSED', 'FAILED', 'MANUAL_REVIEW'], required: true },
    validationTime: { type: Number, default: 0 },
    errors: [{ type: String }],
    
    rawSource: { type: Schema.Types.Mixed },
    aiLogs: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ImportLog = mongoose.model<IImportLog>('ImportLog', importLogSchema);
