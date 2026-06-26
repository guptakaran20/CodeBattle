import { Router } from 'express';
import { getPlatformStats } from './stats.controller.js';
const router = Router();
router.get('/', getPlatformStats);
export default router;
//# sourceMappingURL=stats.routes.js.map