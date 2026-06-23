import { redis } from '../../config/redis.js';

export class PresenceService {
  private static readonly TTL_SECONDS = 30;

  /**
   * Adds or refreshes a user's presence in a battle room.
   */
  static async setPresence(battleCode: string, userId: string): Promise<void> {
    const key = `room:${battleCode}:presence:${userId}`;
    await redis.setex(key, this.TTL_SECONDS, '1');
  }

  /**
   * Removes a user's presence explicitly.
   */
  static async removePresence(battleCode: string, userId: string): Promise<void> {
    const key = `room:${battleCode}:presence:${userId}`;
    await redis.del(key);
  }

  /**
   * Gets all active participants in a battle room by scanning keys.
   * Note: For very large rooms, scanning is better than KEYS.
   */
  static async getActiveParticipants(battleCode: string): Promise<string[]> {
    const pattern = `room:${battleCode}:presence:*`;
    const keys = await redis.keys(pattern);
    
    // Extract userIds from keys
    return keys.map((key: string) => key.split(':').pop() as string);
  }
}
