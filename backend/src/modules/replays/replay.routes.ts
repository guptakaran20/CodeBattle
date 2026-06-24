import { Router } from 'express';
import { ReplayController } from './replay.controller.js';

const router = Router();

router.get('/:battleId/summary', ReplayController.getSummary);
router.get('/:battleId/timeline', ReplayController.getTimeline);
router.get('/:battleId', ReplayController.getRawEvents);

export default router;
