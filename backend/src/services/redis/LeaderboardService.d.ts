export interface LeaderboardEntry {
    userId: string;
    rating: number;
}
export declare class LeaderboardService {
    private static readonly KEY;
    /**
     * Updates a user's rank in the Redis sorted set.
     * Score = rating.
     */
    static updateUserRank(userId: string, rating: number): Promise<void>;
    /**
     * Gets the top players from the leaderboard.
     * Uses ZREVRANGE to get highest scores first.
     */
    static getTopPlayers(limit?: number): Promise<LeaderboardEntry[]>;
    /**
     * Rebuilds the entire Redis leaderboard from the MongoDB users collection.
     * This is used if Redis crashes or is flushed.
     */
    static rebuildLeaderboard(): Promise<void>;
}
//# sourceMappingURL=LeaderboardService.d.ts.map