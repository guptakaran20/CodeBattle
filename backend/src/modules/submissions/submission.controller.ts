import type { Request, Response, NextFunction } from 'express';
import { Submission } from './submission.model.js';
import { Battle } from '../battles/battle.model.js';
import { Problem } from '../problems/problem.model.js';
import { BattleEvent } from '../battles/battleEvent.model.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { z } from 'zod';
import { SubmissionProcessorFactory } from './processors/factory.js';
import { Judge0Service, LANGUAGE_MAPPING } from './judge0.service.js';
import { SocketEvents } from '../websockets/events.js';
import { getIO } from '../websockets/socket.service.js';

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

    if (battle.startTime) {
      const endTime = battle.startTime.getTime() + battle.durationMinutes * 60000;
      if (Date.now() > endTime) {
        battle.status = 'COMPLETED';
        if (!battle.result) {
          battle.result = { winReason: 'TIMEOUT' };
        }
        await battle.save();
        return res.status(400).json({ success: false, message: 'Battle has expired' });
      }
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
      eventType: 'SubmissionCreated',
      payload: { userId: req.user.id, submissionId: submission._id, attemptNumber: validatedData.attemptNumber }
    });

    // Notify clients that submission is pending
    const io = getIO();
    const userObj = req.user as any; // Cast or fetch full user
    io?.to(battle.battleCode).emit(SocketEvents.SUBMISSION_PENDING, {
      userId: req.user.id,
      username: userObj.username || 'User' // Depending on JWT payload, might need fetch from DB if username is missing
    });

    // Delegate to processor
    const processor = SubmissionProcessorFactory.getProcessor();
    processor.submit(submission._id.toString()).catch(console.error);

    return res.status(201).json({ success: true, data: { submission } });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

const runSubmissionSchema = z.object({
  problemId: z.string(),
  language: z.enum(['CPP', 'JAVA', 'PYTHON']),
  code: z.string().min(1)
});

export const runSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = runSubmissionSchema.parse(req.body);

    const problem = await Problem.findById(validatedData.problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    // Only run visible testcases
    const visibleTestcases = problem.testcases.filter((tc: any) => !tc.isHidden);

    const judge0Submissions = visibleTestcases.map((tc: any) => ({
      language_id: LANGUAGE_MAPPING[validatedData.language],
      source_code: validatedData.code,
      stdin: tc.input,
      expected_output: tc.expectedOutput
    }));

    const tokens = await Judge0Service.submitBatch(judge0Submissions);
    
    // For Run Code, we can short-poll synchronously and return results directly.
    let attempts = 0;
    let results: any[] = [];
    while (attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      results = await Judge0Service.getBatchResults(tokens);
      const isFinished = results.every(r => r.status && r.status.id !== 1 && r.status.id !== 2);
      if (isFinished) break;
      attempts++;
    }

    const allPassed = results.every(r => r.status?.id === 3);
    
    return res.status(200).json({ success: true, data: { passed: allPassed, results } });
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
