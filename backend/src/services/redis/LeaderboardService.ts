import { redis } from '../../config/redis.js';
import { User } from '../../modules/users/user.model.js';

export interface LeaderboardEntry {
  userId: string;
  rating: number;
}

export class LeaderboardService {
  private static readonly KEY = 'leaderboard:global';

  /**
   * Updates a user's rank in the Redis sorted set.
   * Score = rating.
   */
  static async updateUserRank(userId: string, rating: number): Promise<void> {
    await redis.zadd(this.KEY, rating, userId);
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
        rating: parseInt(data[i + 1] || '0', 10)
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
    const users = await User.find({}).select('_id rating').lean();
    
    if (users.length === 0) return;

    // Use pipeline for batch insertion
    const pipeline = redis.pipeline();
    pipeline.del(this.KEY); // Clear existing

    for (const user of users) {
      const rating = user.rating || 1000;
      pipeline.zadd(this.KEY, rating, user._id.toString());
    }

    await pipeline.exec();
    console.log(`Leaderboard rebuilt with ${users.length} users.`);
  }
}
