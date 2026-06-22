import { Router } from 'express';
import { createProblem, getProblems, getProblemBySlug } from './problem.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', getProblems as any);
router.get('/:slug', getProblemBySlug as any);
router.post('/', requireAuth as any, createProblem as any);

export default router;
