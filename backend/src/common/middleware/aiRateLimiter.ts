import type { Response, NextFunction } from 'express';
import { redis } from '../../config/redis.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

export const aiRateLimiter = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const today = new Date().toISOString().split('T')[0]; // e.g., '2026-06-24'
    const key = `rate_limit:ai:${userId}:${today}`;

    // Increment request count
    const requests = await redis.incr(key);

    // If this is the first request of the day, set expiration to 24 hours
    if (requests === 1) {
      await redis.expire(key, 24 * 60 * 60);
    }

    const MAX_REQUESTS = 10; // 10 AI requests per day for MVP

    if (requests > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: 'Daily AI request limit exceeded. Please try again tomorrow.',
        errorCode: 'RATE_LIMIT_AI'
      });
    }

    // Attach remaining requests to response headers for the frontend
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - requests));

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail open if Redis is down
    next();
  }
};
