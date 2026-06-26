import { Router } from 'express';
import { createSubmission, getSubmissionsByBattle, runSubmission, getSingleSubmission } from './submission.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
const router = Router();
router.post('/', requireAuth, createSubmission);
router.post('/run', requireAuth, runSubmission);
router.get('/:battleId', requireAuth, getSubmissionsByBattle);
router.get('/single/:id', requireAuth, getSingleSubmission);
export default router;
//# sourceMappingURL=submission.routes.js.map