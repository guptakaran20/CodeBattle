import { Router } from 'express';
import { generateCodeReview, generateSimilarProblem } from './ai.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { aiRateLimiter } from '../../common/middleware/aiRateLimiter.js';

const router = Router();

// Secure all AI routes with authentication and rate limiting
router.post('/review/:submissionId', requireAuth as any, aiRateLimiter as any, generateCodeReview as any);
router.post('/generate-problem', requireAuth as any, aiRateLimiter as any, generateSimilarProblem as any);

export default router;
