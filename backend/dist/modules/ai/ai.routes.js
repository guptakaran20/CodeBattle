import { Router } from 'express';
import { generateCodeReview, generateSimilarProblem } from './ai.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { aiRateLimiter } from '../../common/middleware/aiRateLimiter.js';
const router = Router();
// Secure all AI routes with authentication and rate limiting
router.post('/review/:submissionId', requireAuth, aiRateLimiter, generateCodeReview);
router.post('/generate-problem', requireAuth, aiRateLimiter, generateSimilarProblem);
export default router;
//# sourceMappingURL=ai.routes.js.map