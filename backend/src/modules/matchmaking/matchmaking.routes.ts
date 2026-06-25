import express from 'express';
import { MatchmakingController } from './matchmaking.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth as any);

router.post('/join', requireAuth as any, MatchmakingController.joinQueue as any);
router.post('/leave', requireAuth as any, MatchmakingController.leaveQueue as any);

export default router;
