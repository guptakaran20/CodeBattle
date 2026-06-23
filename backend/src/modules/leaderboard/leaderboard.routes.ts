import { Router } from 'express';
import { getLeaderboard } from './leaderboard.controller.js';

const router = Router();

router.get('/', getLeaderboard as any);

export default router;
