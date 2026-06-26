import { Router } from 'express';
import { createProblem, getProblems, getProblemBySlug } from './problem.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
const router = Router();
router.get('/', getProblems);
router.get('/:slug', getProblemBySlug);
router.post('/', requireAuth, createProblem);
export default router;
//# sourceMappingURL=problem.routes.js.map