import { Router } from 'express';
import { getTournaments, getTournament, joinTournament, checkInTournament, createTournament, startTournament, cancelTournament, openCheckIn } from './tournament.controller.js';
import { requireAuth, requireAdmin } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Public / Participant Routes
router.get('/', getTournaments as any);
router.get('/:id', getTournament as any);
router.post('/:id/join', requireAuth as any, joinTournament as any);
router.post('/:id/check-in', requireAuth as any, checkInTournament as any);

// Admin Routes
router.post('/', requireAdmin as any, createTournament as any);
router.post('/:id/open-checkin', requireAdmin as any, openCheckIn as any);
router.post('/:id/start', requireAdmin as any, startTournament as any);
router.post('/:id/cancel', requireAdmin as any, cancelTournament as any);

export default router;
