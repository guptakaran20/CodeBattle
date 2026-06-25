import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';
import { initializeBattleGateway } from './battle.gateway.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from '../../config/redis.js';

let io: SocketIOServer;

export const initializeSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    },
    adapter: createAdapter(pubClient, subClient)
  });

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const cookiesStr = socket.request.headers.cookie;
      if (!cookiesStr) {
        return next(new Error('Authentication error: No cookies provided'));
      }
      
      const cookies = cookie.parse(cookiesStr);
      const token = cookies.accessToken;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'access_secret_fallback';
      const decoded = jwt.verify(token, accessSecret) as any;
      const user = await User.findById(decoded.userId).select('username name avatar');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket context
      (socket as any).user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // Initialize Gateways
  initializeBattleGateway(io);

  // Subscribe to Notification events from Redis
  const notificationSub = pubClient.duplicate();
  notificationSub.subscribe('notifications:pubsub').catch(console.error);
  notificationSub.on('message', (channel, message) => {
    if (channel === 'notifications:pubsub') {
      try {
        const payload = JSON.parse(message);
        const { userId, event, notification, notificationId } = payload;
        io.to(`user_${userId}`).emit(event, { notification, notificationId });
      } catch (err) {
        console.error('Failed to parse notification pubsub message:', err);
      }
    }
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io is not initialized');
  return io;
};
