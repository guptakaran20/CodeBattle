import { Router } from 'express';
import { getLeaderboard, getRanks } from './leaderboard.controller.js';
const router = Router();
router.get('/', getLeaderboard);
router.get('/ranks', getRanks);
export default router;
//# sourceMappingURL=leaderboard.routes.js.map