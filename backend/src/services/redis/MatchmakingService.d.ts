export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export interface PlayerQueueState {
    elo: number;
    joinedAt: number;
    status: string;
}
export declare class MatchmakingService {
    /**
     * Generates the ZSET key for a specific difficulty queue.
     */
    static getQueueKey(difficulty: Difficulty): string;
    /**
     * Generates the HASH key for a specific player's state.
     */
    static getPlayerStateKey(userId: string): string;
    /**
     * Adds a user to the matchmaking queue for a specific difficulty.
     */
    static joinQueue(userId: string, elo: number, difficulty: Difficulty): Promise<void>;
    /**
     * Removes a user from their queue and cleans up their state.
     */
    static leaveQueue(userId: string): Promise<void>;
    /**
     * Gets a player's current queue state.
     */
    static getPlayerState(userId: string): Promise<PlayerQueueState | null>;
    /**
     * Calculates the dynamic search radius based on how long the user has been waiting.
     * 0-30s -> ±100, 30-60s -> ±200, >60s -> ±300
     */
    static getDynamicSearchRadius(joinedAt: number): number;
    /**
     * Retrieves all users currently in a specific queue.
     */
    static getQueueMembers(difficulty: Difficulty): Promise<string[]>;
    /**
     * Finds potential opponents within a specific Elo range.
     */
    static findOpponentsInRange(difficulty: Difficulty, userElo: number, radius: number, excludeUserId: string): Promise<string[]>;
}
//# sourceMappingURL=MatchmakingService.d.ts.map