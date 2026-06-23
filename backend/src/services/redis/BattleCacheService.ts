import { redis } from '../../config/redis.js';

export interface BattleCacheData {
  status: string;
  participants: number;
  startTime?: string;
  endTime?: string;
}

export class BattleCacheService {
  private static readonly TTL_SECONDS = 60 * 60 * 3; // 3 hours

  static async setBattle(battleCode: string, data: BattleCacheData): Promise<void> {
    const key = `battle:${battleCode}`;
    await redis.setex(key, this.TTL_SECONDS, JSON.stringify(data));
  }

  static async getBattle(battleCode: string): Promise<BattleCacheData | null> {
    const key = `battle:${battleCode}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async deleteBattle(battleCode: string): Promise<void> {
    const key = `battle:${battleCode}`;
    await redis.del(key);
  }
}
