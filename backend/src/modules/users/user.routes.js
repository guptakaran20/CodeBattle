import { Router } from 'express';
import { getUserByUsername, updateMe, getRatingHistory, getPublicRatingHistory } from './user.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import { requireGoogleVerification } from '../../common/middleware/verification.middleware.js';
const router = Router();
router.patch('/me', requireAuth, requireGoogleVerification, updateMe);
router.get('/me/rating-history', requireAuth, getRatingHistory);
router.get('/:username/rating-history', getPublicRatingHistory);
router.get('/:username', getUserByUsername);
export default router;
//# sourceMappingURL=user.routes.js.map