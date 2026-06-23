import { redis } from '../../config/redis.js';
import { User } from '../../modules/users/user.model.js';

export interface LeaderboardEntry {
  userId: string;
  elo: number;
}

export class LeaderboardService {
  private static readonly KEY = 'leaderboard:global';

  /**
   * Updates a user's rank in the Redis sorted set.
   * Score = Elo rating.
   */
  static async updateUserRank(userId: string, elo: number): Promise<void> {
    await redis.zadd(this.KEY, elo, userId);
  }

  /**
   * Gets the top players from the leaderboard.
   * Uses ZREVRANGE to get highest scores first.
   */
  static async getTopPlayers(limit: number = 50): Promise<LeaderboardEntry[]> {
    // ZREVRANGE returns array of [member1, score1, member2, score2, ...]
    const data = await redis.zrevrange(this.KEY, 0, limit - 1, 'WITHSCORES');
    
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < data.length; i += 2) {
      entries.push({
        userId: data[i] || '',
        elo: parseInt(data[i + 1] || '0', 10)
      });
    }
    
    return entries;
  }

  /**
   * Rebuilds the entire Redis leaderboard from the MongoDB users collection.
   * This is used if Redis crashes or is flushed.
   */
  static async rebuildLeaderboard(): Promise<void> {
    console.log('Rebuilding leaderboard from MongoDB...');
    const users = await User.find({}).select('_id elo').lean();
    
    if (users.length === 0) return;

    // Use pipeline for batch insertion
    const pipeline = redis.pipeline();
    pipeline.del(this.KEY); // Clear existing

    for (const user of users) {
      // Default elo to 1200 if not present
      const elo = (user as any).elo || 1200;
      pipeline.zadd(this.KEY, elo, user._id.toString());
    }

    await pipeline.exec();
    console.log(`Leaderboard rebuilt with ${users.length} users.`);
  }
}
