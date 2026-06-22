import { Router } from 'express';
import { createBattle, getBattleHistory, getBattle, joinBattle, startBattle, cancelBattle } from './battle.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth as any, getBattleHistory as any);
router.post('/', requireAuth as any, createBattle as any);
router.get('/:battleCode', getBattle as any);
router.post('/:battleCode/join', requireAuth as any, joinBattle as any);
router.post('/:battleCode/start', requireAuth as any, startBattle as any);
router.delete('/:battleCode', requireAuth as any, cancelBattle as any);

export default router;
