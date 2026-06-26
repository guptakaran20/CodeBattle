import { Router } from 'express';
import { judge0Webhook } from './judge0.controller.js';
const router = Router();
router.put('/webhook', judge0Webhook); // Judge0 sends PUT by default
export default router;
//# sourceMappingURL=judge0.routes.js.map