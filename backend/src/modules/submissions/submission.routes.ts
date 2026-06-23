import { Router } from 'express';
import { createSubmission, getSubmissionsByBattle, runSubmission, getSingleSubmission } from './submission.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.post('/', requireAuth as any, createSubmission as any);
router.post('/run', requireAuth as any, runSubmission as any);
router.get('/:battleId', requireAuth as any, getSubmissionsByBattle as any);
router.get('/single/:id', requireAuth as any, getSingleSubmission as any);

export default router;
