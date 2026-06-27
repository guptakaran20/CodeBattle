import { Redis, type RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 30000,
  socketTimeout: 5000,
  connectTimeout: 10000,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// Export a configured singleton instance of Redis
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: 'localhost',  // Use 'redis' if using Docker Compose with service name
      port: 6379,
      db: 0,
      ...redisOptions,
    });

redis.on('connect', () => {
  console.log('Connected to Redis successfully');
});

redis.on('error', (err:any) => {
  console.error('Redis connection error:', err);
});

// Create separate pub/sub clients for socket.io redis adapter
export const pubClient = redis.duplicate();
export const subClient = redis.duplicate();
