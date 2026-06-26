import { redis } from '../../config/redis.js';
export class SubmissionCacheService {
    static TTL_SECONDS = 60 * 6; // 6 minutes (typical max submission run time is short)
    static async setSubmission(id, data) {
        const key = `submission:${id}`;
        await redis.setex(key, this.TTL_SECONDS, JSON.stringify(data));
    }
    static async getSubmission(id) {
        const key = `submission:${id}`;
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    }
    static async updateStatus(id, status, passed) {
        const current = await this.getSubmission(id);
        if (current) {
            current.status = status;
            if (passed !== undefined)
                current.passed = passed;
            await this.setSubmission(id, current);
        }
    }
    static async deleteSubmission(id) {
        const key = `submission:${id}`;
        await redis.del(key);
    }
}
//# sourceMappingURL=SubmissionCacheService.js.map