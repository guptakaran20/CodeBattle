import type { Request, Response, NextFunction } from 'express';
import { Submission } from './submission.model.js';
import { Battle } from '../battles/battle.model.js';
import { BattleEvent } from '../battles/battleEvent.model.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { z } from 'zod';

const createSubmissionSchema = z.object({
  battleId: z.string(),
  problemId: z.string(),
  language: z.enum(['CPP', 'JAVA', 'PYTHON']),
  code: z.string().min(1),
  attemptNumber: z.number().min(1)
});

export const createSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createSubmissionSchema.parse(req.body);

    const battle = await Battle.findById(validatedData.battleId);
    if (!battle) {
      return res.status(404).json({ success: false, message: 'Battle not found' });
    }

    if (battle.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Battle is not active' });
    }

    const submission = await Submission.create({
      ...validatedData,
      user: req.user.id,
      battle: battle._id,
      problem: validatedData.problemId,
      status: 'PENDING'
    } as any);

    await BattleEvent.create({
      battleId: battle._id,
      eventType: 'SubmissionMade',
      payload: { userId: req.user.id, submissionId: submission._id, attemptNumber: validatedData.attemptNumber }
    });

    return res.status(201).json({ success: true, data: { submission } });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

export const getSubmissionsByBattle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const battle = await Battle.findById(req.params.battleId as string);
    if (!battle) {
      return res.status(404).json({ success: false, message: 'Battle not found' });
    }

    const submissions = await Submission.find({ battle: battle._id })
      .populate('user', 'username name')
      .sort({ submittedAt: -1 });

    return res.status(200).json({ success: true, data: { submissions } });
  } catch (error) {
    next(error);
  }
};
