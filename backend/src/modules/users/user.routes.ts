import { Router } from 'express';
import { getUserByUsername, updateMe, getRatingHistory, getPublicRatingHistory } from './user.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { requireGoogleVerification } from '../../common/middleware/verification.middleware.js';

const router = Router();

router.patch('/me', requireAuth as any, requireGoogleVerification as any, updateMe as any);
router.get('/me/rating-history', requireAuth as any, getRatingHistory as any);
router.get('/:username/rating-history', getPublicRatingHistory as any);
router.get('/:username', getUserByUsername as any);

export default router;
