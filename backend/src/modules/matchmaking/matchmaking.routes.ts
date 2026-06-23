import express from 'express';
import { MatchmakingController } from './matchmaking.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = express.Router();

router.use(requireAuth);

router.post('/join', requireAuth, MatchmakingController.joinQueue);
router.post('/leave', requireAuth, MatchmakingController.leaveQueue);
router.post('/challenge', requireAuth, MatchmakingController.challengeUser);
router.post('/challenge/:challengeId/accept', requireAuth, MatchmakingController.acceptChallenge);

export default router;
