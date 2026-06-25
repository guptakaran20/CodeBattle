import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { NotificationService } from '../../services/notifications/NotificationService.js';

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as AuthenticatedRequest;
    const notifications = await NotificationService.get(userReq.user.id);
    const unreadCount = await NotificationService.getUnreadCount(userReq.user.id);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as AuthenticatedRequest;
    await NotificationService.markAllRead(userReq.user.id);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as AuthenticatedRequest;
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID required' });
    await NotificationService.markRead(userReq.user.id, id as string);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userReq = req as AuthenticatedRequest;
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID required' });
    await NotificationService.delete(userReq.user.id, id as string);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
