import { Router } from 'express';
import { createSubmission, getSubmissionsByBattle } from './submission.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post('/', requireAuth as any, createSubmission as any);
router.get('/:battleId', requireAuth as any, getSubmissionsByBattle as any);

export default router;
