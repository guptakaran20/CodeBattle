import { Router } from 'express';
import { getTournaments, getTournament, joinTournament, checkInTournament, createTournament, startTournament, cancelTournament, openCheckIn } from './tournament.controller.js';
import { requireAuth, requireAdmin } from '../../common/middleware/auth.middleware.js';
const router = Router();
// Public / Participant Routes
router.get('/', getTournaments);
router.get('/:id', getTournament);
router.post('/:id/join', requireAuth, joinTournament);
router.post('/:id/check-in', requireAuth, checkInTournament);
// Admin Routes
router.post('/', requireAdmin, createTournament);
router.post('/:id/open-checkin', requireAdmin, openCheckIn);
router.post('/:id/start', requireAdmin, startTournament);
router.post('/:id/cancel', requireAdmin, cancelTournament);
export default router;
//# sourceMappingURL=tournament.routes.js.map