import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';

export interface NotificationData {
  battleCode?: string;
  tournamentId?: string;
  challengeId?: string;
  replayId?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const { isAuthenticated, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // Ensure socket is connected now that we are authenticated
      if (!socket.connected) {
        socket.connect();
      }

      // Listen for socket connection event to resync
      const onConnect = () => {
        fetchNotifications();
      };
      
      const onNewNotification = (data: { notification: Notification }) => {
        setNotifications(prev => [data.notification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
        
        if (data.notification.type === 'RATING_CHANGED') {
          // Trigger a refresh of the AuthContext user to reflect the new rating across the app in real-time
          refreshUser?.(true);
        }
      };

      const onNotificationRead = (data: { notificationId: string }) => {
        setNotifications(prev => prev.map(n => n.id === data.notificationId ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      const onNotificationSync = () => {
        fetchNotifications();
      };

      const onNotificationDeleted = (data: { notificationId: string }) => {
        setNotifications(prev => {
          const target = prev.find(n => n.id === data.notificationId);
          if (target && !target.isRead) {
            setUnreadCount(count => Math.max(0, count - 1));
          }
          return prev.filter(n => n.id !== data.notificationId);
        });
      };

      socket.on('connect', onConnect);
      socket.on('NEW_NOTIFICATION', onNewNotification);
      socket.on('NOTIFICATION_READ', onNotificationRead);
      socket.on('NOTIFICATION_SYNC', onNotificationSync);
      socket.on('NOTIFICATION_DELETED', onNotificationDeleted);

      return () => {
        socket.off('connect', onConnect);
        socket.off('NEW_NOTIFICATION', onNewNotification);
        socket.off('NOTIFICATION_READ', onNotificationRead);
        socket.off('NOTIFICATION_SYNC', onNotificationSync);
        socket.off('NOTIFICATION_DELETED', onNotificationDeleted);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (socket.connected) {
        socket.disconnect();
      }
    }
  }, [isAuthenticated, fetchNotifications, refreshUser]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (e) {
      // Revert if failed
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.patch('/notifications/read');
    } catch (e) {
      fetchNotifications();
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target && !target.isRead) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
    try {
      await api.delete(`/notifications/${id}`);
    } catch (e) {
      fetchNotifications();
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
