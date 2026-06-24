import { Router } from 'express';
import { getLeaderboard, getRanks } from './leaderboard.controller.js';

const router = Router();

router.get('/', getLeaderboard as any);
router.get('/ranks', getRanks as any);

export default router;
