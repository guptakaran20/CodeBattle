import { Router } from 'express';
import { getTournaments, getTournament, joinTournament, checkInTournament, createTournament, startTournament, cancelTournament, openCheckIn } from './tournament.controller.js';
import { requireAuth } from '../../common/middleware/auth.middleware.js';

const router = Router();

// Public / Participant Routes
router.get('/', getTournaments as any);
router.get('/:id', getTournament as any);
router.post('/:id/join', requireAuth as any, joinTournament as any);
router.post('/:id/check-in', requireAuth as any, checkInTournament as any);

// Admin Routes (For MVP, we just rely on auth, ideally we'd have a requireAdmin middleware)
router.post('/', requireAuth as any, createTournament as any);
router.post('/:id/open-checkin', requireAuth as any, openCheckIn as any);
router.post('/:id/start', requireAuth as any, startTournament as any);
router.post('/:id/cancel', requireAuth as any, cancelTournament as any);

export default router;
