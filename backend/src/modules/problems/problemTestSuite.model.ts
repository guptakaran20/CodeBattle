import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProblemTestSuite extends Document {
  problemId: Types.ObjectId;
  version: number;
  checkerType: 'STANDARD' | 'SPECIAL' | 'CUSTOM';
  generatedAt: Date;
  cases: {
    input: string;
    expectedOutput: string;
    weight: number;
    isEdgeCase: boolean;
    group: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const problemTestSuiteSchema = new Schema<IProblemTestSuite>(
  {
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
  },
  { timestamps: true }
);

export const ProblemTestSuite = mongoose.model<IProblemTestSuite>('ProblemTestSuite', problemTestSuiteSchema);
