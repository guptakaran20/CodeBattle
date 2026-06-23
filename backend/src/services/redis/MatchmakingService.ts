import { redis } from '../../config/redis.js';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface PlayerQueueState {
  elo: number;
  joinedAt: number;
  status: string;
}

export class MatchmakingService {
  /**
   * Generates the ZSET key for a specific difficulty queue.
   */
  static getQueueKey(difficulty: Difficulty): string {
    return `matchmaking:1v1:${difficulty}`;
  }

  /**
   * Generates the HASH key for a specific player's state.
   */
  static getPlayerStateKey(userId: string): string {
    return `matchmaking:player:${userId}`;
  }

  /**
   * Adds a user to the matchmaking queue for a specific difficulty.
   */
  static async joinQueue(userId: string, elo: number, difficulty: Difficulty): Promise<void> {
    const queueKey = this.getQueueKey(difficulty);
    const stateKey = this.getPlayerStateKey(userId);
    const joinedAt = Date.now();

    // Use a transaction pipeline to ensure both operations succeed
    const pipeline = redis.pipeline();
    
    // Add to ZSET with Elo as score
    pipeline.zadd(queueKey, elo, userId);
    
    // Store player state in HASH
    pipeline.hset(stateKey, {
      elo: elo.toString(),
      joinedAt: joinedAt.toString(),
      status: 'SEARCHING',
      difficulty: difficulty
    });

    await pipeline.exec();
  }

  /**
   * Removes a user from their queue and cleans up their state.
   */
  static async leaveQueue(userId: string): Promise<void> {
    const stateKey = this.getPlayerStateKey(userId);
    
    // Find what difficulty they were queueing for
    const difficultyStr = await redis.hget(stateKey, 'difficulty');
    if (!difficultyStr) return; // Not in queue

    const queueKey = this.getQueueKey(difficultyStr as Difficulty);

    const pipeline = redis.pipeline();
    pipeline.zrem(queueKey, userId);
    pipeline.del(stateKey);
    await pipeline.exec();
  }

  /**
   * Gets a player's current queue state.
   */
  static async getPlayerState(userId: string): Promise<PlayerQueueState | null> {
    const stateKey = this.getPlayerStateKey(userId);
    const data = await redis.hgetall(stateKey);
    
    if (!data || Object.keys(data).length === 0) return null;

    return {
      elo: parseInt(data.elo || '1500', 10),
      joinedAt: parseInt(data.joinedAt || '0', 10),
      status: data.status || 'SEARCHING'
    };
  }

  /**
   * Calculates the dynamic search radius based on how long the user has been waiting.
   * 0-30s -> ±100, 30-60s -> ±200, >60s -> ±300
   */
  static getDynamicSearchRadius(joinedAt: number): number {
    const waitTimeSec = (Date.now() - joinedAt) / 1000;
    if (waitTimeSec < 30) return 100;
    if (waitTimeSec < 60) return 200;
    return 300;
  }

  /**
   * Retrieves all users currently in a specific queue.
   */
  static async getQueueMembers(difficulty: Difficulty): Promise<string[]> {
    const queueKey = this.getQueueKey(difficulty);
    return await redis.zrange(queueKey, 0, -1);
  }

  /**
   * Finds potential opponents within a specific Elo range.
   */
  static async findOpponentsInRange(difficulty: Difficulty, userElo: number, radius: number, excludeUserId: string): Promise<string[]> {
    const queueKey = this.getQueueKey(difficulty);
    const min = userElo - radius;
    const max = userElo + radius;

    const potentialOpponents = await redis.zrangebyscore(queueKey, min, max);
    return potentialOpponents.filter((id: string) => id !== excludeUserId);
  }
}
