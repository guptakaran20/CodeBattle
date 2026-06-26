import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProblem extends Document {
  leetcodeId?: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  
  // Frontend Rendering
  statementHtml: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  tags: string[];
  companies: string[];
  
  // Code execution definitions
  starterCodes: {
    language: string;
    version: string;
    code: string;
  }[];
  functionMetadata?: {
    functionName: string;
    returnType: string;
    parameters: string;
    className?: string;
  };
  
  execution: {
    timeLimit: number;
    memoryLimit: number;
  };
  
  // Game & App Metadata
  battle: {
    enabled: boolean;
    weight: number;
  };
  contest: {
    visible: boolean;
  };
  
  versions: {
    problemVersion: number;
    testSuiteVersion: number;
  };
  
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const problemSchema = new Schema<IProblem>(
  {
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
  },
  { timestamps: true }
);

export const Problem = mongoose.model<IProblem>('Problem', problemSchema);
