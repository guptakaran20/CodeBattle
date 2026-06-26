import mongoose, { Schema, Document } from 'mongoose';

export interface IImportRun extends Document {
  startedAt: Date;
  finishedAt?: Date;
  
  easyImported: number;
  mediumImported: number;
  hardImported: number;
  
  published: number;
  draft: number;
  failed: number;
  
  duration?: number; // in milliseconds
  createdAt: Date;
  updatedAt: Date;
}

const importRunSchema = new Schema<IImportRun>(
  {
    startedAt: { type: Date, required: true, default: Date.now },
    finishedAt: { type: Date },
    
    easyImported: { type: Number, default: 0 },
    mediumImported: { type: Number, default: 0 },
    hardImported: { type: Number, default: 0 },
    
    published: { type: Number, default: 0 },
    draft: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    
    duration: { type: Number },
  },
  { timestamps: true }
);

export const ImportRun = mongoose.model<IImportRun>('ImportRun', importRunSchema);
