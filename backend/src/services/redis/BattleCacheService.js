import { redis } from '../../config/redis.js';
export class BattleCacheService {
    static TTL_SECONDS = 60 * 60 * 3; // 3 hours
    static async setBattle(battleCode, data) {
        const key = `battle:${battleCode}`;
        await redis.setex(key, this.TTL_SECONDS, JSON.stringify(data));
    }
    static async getBattle(battleCode) {
        const key = `battle:${battleCode}`;
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    static async deleteBattle(battleCode) {
        const key = `battle:${battleCode}`;
        await redis.del(key);
    }
}
//# sourceMappingURL=BattleCacheService.js.map