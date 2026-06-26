export type NotificationType = "MATCH_FOUND" | "CHALLENGE_RECEIVED" | "CHALLENGE_ACCEPTED" | "BATTLE_STARTED" | "BATTLE_WON" | "BATTLE_LOST" | "TOURNAMENT_STARTED" | "TOURNAMENT_ADVANCED" | "TOURNAMENT_ELIMINATED" | "RATING_CHANGED" | "AI_REVIEW_READY" | "SYSTEM" | "MATCHMAKING_SEARCHING" | "MATCHMAKING_CANCELLED";
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
export declare class NotificationService {
    private static readonly MAX_HISTORY;
    private static readonly CHANNEL;
    /**
     * Send a new notification to a specific user.
     */
    static send(userId: string, payload: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification>;
    /**
     * Fetch a user's notification history.
     */
    static get(userId: string): Promise<Notification[]>;
    /**
     * Get the total unread count for a user.
     */
    static getUnreadCount(userId: string): Promise<number>;
    /**
     * Mark all notifications as read.
     */
    static markAllRead(userId: string): Promise<void>;
    /**
     * Mark a specific notification as read.
     */
    static markRead(userId: string, notificationId: string): Promise<void>;
    /**
     * Delete a specific notification.
     */
    static delete(userId: string, notificationId: string): Promise<void>;
}
//# sourceMappingURL=NotificationService.d.ts.map