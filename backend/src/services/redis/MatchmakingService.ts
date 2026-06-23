import { redis } from '../../config/redis.js';

export class MatchmakingService {
  private static readonly KEY = 'matchmaking:1v1';

  /**
   * Adds a user to the matchmaking queue with their current Elo score.
   */
  static async joinQueue(userId: string, elo: number): Promise<void> {
    await redis.zadd(this.KEY, elo, userId);
  }

  /**
   * Removes a user from the matchmaking queue.
   */
  static async leaveQueue(userId: string): Promise<void> {
    await redis.zrem(this.KEY, userId);
  }

  /**
   * Finds potential opponents for a user within a specific Elo range.
   * e.g., range = 100 means find players with Elo between (userElo - 100) and (userElo + 100).
   */
  static async findMatch(userId: string, userElo: number, range: number = 100): Promise<string | null> {
    const min = userElo - range;
    const max = userElo + range;

    // Get members in range
    const potentialOpponents = await redis.zrangebyscore(this.KEY, min, max);

    // Filter out the requesting user
    const opponents = potentialOpponents.filter((id: string) => id !== userId);

    if (opponents.length > 0) {
      // Pick the first valid opponent (simplest strategy for now)
      return opponents[0] || null;
    }

    return null;
  }
}
