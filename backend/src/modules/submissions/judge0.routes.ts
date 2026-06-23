import { Router } from 'express';
import { judge0Webhook } from './judge0.controller.js';

const router = Router();

router.put('/webhook', judge0Webhook as any); // Judge0 sends PUT by default

export default router;
