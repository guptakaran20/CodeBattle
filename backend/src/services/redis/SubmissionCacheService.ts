import { redis } from '../../config/redis.js';

export interface SubmissionCacheData {
  status: string;
  judge0Token?: string;
  passed?: boolean;
}

export class SubmissionCacheService {
  private static readonly TTL_SECONDS = 60 * 6; // 6 minutes (typical max submission run time is short)

  static async setSubmission(id: string, data: SubmissionCacheData): Promise<void> {
    const key = `submission:${id}`;
    await redis.setex(key, this.TTL_SECONDS, JSON.stringify(data));
  }

  static async getSubmission(id: string): Promise<SubmissionCacheData | null> {
    const key = `submission:${id}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async updateStatus(id: string, status: string, passed?: boolean): Promise<void> {
    const current = await this.getSubmission(id);
    if (current) {
      current.status = status;
      if (passed !== undefined) current.passed = passed;
      await this.setSubmission(id, current);
    }
  }

  static async deleteSubmission(id: string): Promise<void> {
    const key = `submission:${id}`;
    await redis.del(key);
  }
}
