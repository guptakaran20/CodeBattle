import { Redis } from 'ioredis';

// Export a configured singleton instance of Redis
export const redis = new Redis({
  host: 'localhost',  // Use 'redis' if using Docker Compose with service name
  port: 6379,
  // password: process.env.REDIS_PASSWORD,
  db: 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  keepAlive: 30000,
  socketTimeout: 5000,
  connectTimeout: 10000,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
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
