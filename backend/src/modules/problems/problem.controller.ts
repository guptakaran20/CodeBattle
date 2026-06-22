import type { Request, Response, NextFunction } from 'express';
import { Problem } from './problem.model.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { z } from 'zod';

const createProblemSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  tags: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional()
  })).optional(),
  starterCode: z.object({
    CPP: z.string().optional(),
    JAVA: z.string().optional(),
    PYTHON: z.string().optional()
  }).optional(),
  testcases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isHidden: z.boolean().optional()
  })),
  source: z.enum(['ORIGINAL', 'AI_GENERATED']).optional(),
  isPublished: z.boolean().optional()
});

export const createProblem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createProblemSchema.parse(req.body);

    const existingProblem = await Problem.findOne({ slug: validatedData.slug });
    if (existingProblem) {
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    }

    const problem = await Problem.create({
      ...validatedData,
      createdBy: req.user.id
    } as any);

    return res.status(201).json({ success: true, data: { problem } });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

export const getProblems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problems = await Problem.find({ isPublished: true })
      .select('title slug difficulty tags')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { problems } });
  } catch (error) {
    next(error);
  }
};

export const getProblemBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug as string });
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }
    return res.status(200).json({ success: true, data: { problem } });
  } catch (error) {
    next(error);
  }
};
