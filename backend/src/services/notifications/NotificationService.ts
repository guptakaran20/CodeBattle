import { nanoid } from 'nanoid';
import { redis, pubClient } from '../../config/redis.js';

export type NotificationType = 
  | "MATCH_FOUND"
  | "CHALLENGE_RECEIVED"
  | "CHALLENGE_ACCEPTED"
  | "BATTLE_STARTED"
  | "BATTLE_WON"
  | "BATTLE_LOST"
  | "TOURNAMENT_STARTED"
  | "TOURNAMENT_ADVANCED"
  | "TOURNAMENT_ELIMINATED"
  | "RATING_CHANGED"
  | "AI_REVIEW_READY"
  | "SYSTEM"
  | "MATCHMAKING_SEARCHING"
  | "MATCHMAKING_CANCELLED";

export interface NotificationData {
  battleCode?: string;
  tournamentId?: string;
  challengeId?: string;
  replayId?: string;
  [key: string]: any;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  private static readonly MAX_HISTORY = 50;
  private static readonly CHANNEL = 'notifications:pubsub';

  /**
   * Send a new notification to a specific user.
   */
  public static async send(userId: string, payload: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> {
    const notification: Notification = {
      ...payload,
      id: nanoid(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const listKey = `notifications:${userId}:list`;
    const countKey = `notifications:${userId}:unreadCount`;

    const pipeline = redis.pipeline();
    // Prepend to list
    pipeline.lpush(listKey, JSON.stringify(notification));
    // Trim list to max size
    pipeline.ltrim(listKey, 0, this.MAX_HISTORY - 1);
    // Increment unread count
    pipeline.incr(countKey);

    await pipeline.exec();

    // Publish to Redis Pub/Sub for Socket.IO dispatch
    await pubClient.publish(this.CHANNEL, JSON.stringify({
      userId,
      event: 'NEW_NOTIFICATION',
      notification,
    }));

    return notification;
  }

  /**
   * Fetch a user's notification history.
   */
  public static async get(userId: string): Promise<Notification[]> {
    const listKey = `notifications:${userId}:list`;
    const rawList = await redis.lrange(listKey, 0, -1);
    return rawList.map(item => JSON.parse(item));
  }

  /**
   * Get the total unread count for a user.
   */
  public static async getUnreadCount(userId: string): Promise<number> {
    const countKey = `notifications:${userId}:unreadCount`;
    const count = await redis.get(countKey);
    return count ? parseInt(count, 10) : 0;
  }

  /**
   * Mark all notifications as read.
   */
  public static async markAllRead(userId: string): Promise<void> {
    const listKey = `notifications:${userId}:list`;
    const countKey = `notifications:${userId}:unreadCount`;

    const rawList = await redis.lrange(listKey, 0, -1);
    if (rawList.length === 0) return;

    const updatedList = rawList.map(item => {
      const parsed = JSON.parse(item);
      parsed.isRead = true;
      return JSON.stringify(parsed);
    });

    const pipeline = redis.pipeline();
    pipeline.del(listKey);
    pipeline.rpush(listKey, ...updatedList);
    pipeline.set(countKey, 0);
    await pipeline.exec();

    // Publish event
    await pubClient.publish(this.CHANNEL, JSON.stringify({
      userId,
      event: 'NOTIFICATION_SYNC',
    }));
  }

  /**
   * Mark a specific notification as read.
   */
  public static async markRead(userId: string, notificationId: string): Promise<void> {
    const listKey = `notifications:${userId}:list`;
    const countKey = `notifications:${userId}:unreadCount`;

    const rawList = await redis.lrange(listKey, 0, -1);
    const index = rawList.findIndex(item => JSON.parse(item).id === notificationId);
    
    if (index === -1) return;
    const item = rawList[index];
    if (!item) return;

    const parsed = JSON.parse(item);
    if (!parsed.isRead) {
      parsed.isRead = true;
      
      const pipeline = redis.pipeline();
      pipeline.lset(listKey, index, JSON.stringify(parsed));
      
      // We must decrement safely to avoid negative counts
      const currentCount = await this.getUnreadCount(userId);
      if (currentCount > 0) {
        pipeline.decr(countKey);
      }
      
      await pipeline.exec();

      await pubClient.publish(this.CHANNEL, JSON.stringify({
        userId,
        event: 'NOTIFICATION_READ',
        notificationId
      }));
    }
  }

  /**
   * Delete a specific notification.
   */
  public static async delete(userId: string, notificationId: string): Promise<void> {
    const listKey = `notifications:${userId}:list`;
    const countKey = `notifications:${userId}:unreadCount`;

    const rawList = await redis.lrange(listKey, 0, -1);
    const itemToDelete = rawList.find(item => {
      if (!item) return false;
      return JSON.parse(item).id === notificationId;
    });

    if (!itemToDelete) return;

    const parsed = JSON.parse(itemToDelete);
    
    const pipeline = redis.pipeline();
    pipeline.lrem(listKey, 1, itemToDelete);
    
    if (!parsed.isRead) {
      const currentCount = await this.getUnreadCount(userId);
      if (currentCount > 0) {
        pipeline.decr(countKey);
      }
    }
    
    await pipeline.exec();

    await pubClient.publish(this.CHANNEL, JSON.stringify({
      userId,
      event: 'NOTIFICATION_DELETED',
      notificationId
    }));
  }
}
