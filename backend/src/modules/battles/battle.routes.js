import { Router } from 'express';
import { createBattle, getBattleHistory, getBattle, joinBattle, startBattle, cancelBattle, leaveBattle } from './battle.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
const router = Router();
router.get('/', requireAuth, getBattleHistory);
router.post('/', requireAuth, createBattle);
router.get('/:battleCode', getBattle);
router.post('/:battleCode/join', requireAuth, joinBattle);
router.post('/:battleCode/start', requireAuth, startBattle);
router.delete('/:battleCode', requireAuth, cancelBattle);
router.post('/:battleCode/leave', requireAuth, leaveBattle);
export default router;
//# sourceMappingURL=battle.routes.js.map