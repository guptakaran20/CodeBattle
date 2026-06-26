import express from 'express';
import { MatchmakingController } from './matchmaking.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
const router = express.Router();
router.use(requireAuth);
router.post('/join', requireAuth, MatchmakingController.joinQueue);
router.post('/leave', requireAuth, MatchmakingController.leaveQueue);
router.get('/feed', requireAuth, MatchmakingController.getFeedHistory);
export default router;
//# sourceMappingURL=matchmaking.routes.js.map