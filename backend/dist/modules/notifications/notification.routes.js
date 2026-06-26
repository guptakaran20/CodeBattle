import { Router } from 'express';
import { requireAuth } from '../../common/middleware/auth.middleware.js';
import * as NotificationController from './notification.controller.js';
const router = Router();
router.use(requireAuth);
router.get('/', NotificationController.getNotifications);
router.patch('/read', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);
router.delete('/:id', NotificationController.deleteNotification);
export default router;
//# sourceMappingURL=notification.routes.js.map