import { NotificationService } from '../../services/notifications/NotificationService.js';
export const getNotifications = async (req, res, next) => {
    try {
        const userReq = req;
        const notifications = await NotificationService.get(userReq.user.id);
        const unreadCount = await NotificationService.getUnreadCount(userReq.user.id);
        return res.status(200).json({
            success: true,
            data: {
                notifications,
                unreadCount
            }
        });
    }
    catch (error) {
        next(error);
    }
};
export const markAllAsRead = async (req, res, next) => {
    try {
        const userReq = req;
        await NotificationService.markAllRead(userReq.user.id);
        return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
export const markAsRead = async (req, res, next) => {
    try {
        const userReq = req;
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ success: false, message: 'ID required' });
        await NotificationService.markRead(userReq.user.id, id);
        return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
export const deleteNotification = async (req, res, next) => {
    try {
        const userReq = req;
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ success: false, message: 'ID required' });
        await NotificationService.delete(userReq.user.id, id);
        return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=notification.controller.js.map