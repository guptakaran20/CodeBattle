import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Environment validation (this will throw and exit if env is invalid)
import { env } from './config/env.js';
import { logger } from './common/logger.js';
import { requestIdMiddleware } from './common/middleware/request-id.middleware.js';
import { metricsMiddleware, getMetrics } from './common/monitoring/prometheus.js';

import { connectDB } from './config/database.js';
import { globalErrorHandler } from './common/middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import problemRoutes from './modules/problems/problem.routes.js';
import battleRoutes from './modules/battles/battle.routes.js';
import submissionRoutes from './modules/submissions/submission.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import judge0Routes from './modules/submissions/judge0.routes.js';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes.js';
import matchmakingRoutes from './modules/matchmaking/matchmaking.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';
import replayRoutes from './modules/replays/replay.routes.js';
import tournamentRoutes from './modules/tournaments/tournament.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';

import { ReplayWorker } from './workers/replay.worker.js';
import { initializeSocket, getIO } from './modules/websockets/socket.service.js';
import { MatchmakingEngine } from './modules/matchmaking/matchmaking.engine.js';
import { LeaderboardService } from './services/redis/LeaderboardService.js';
import { redis } from './config/redis.js';
import { seedAdmin } from './scripts/seedAdmin.js';

const app = express();
const port = env.PORT;

// Setup HTTP Server
const httpServer = http.createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Apply Security and Performance Middlewares
app.use(helmet());
app.use(compression());

// Apply Request ID and Logger
app.use(requestIdMiddleware);

// Apply Metrics Middleware
app.use(metricsMiddleware);

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Strict CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Connect DB
connectDB();

// Liveness & Readiness Probes
app.get('/api/health/live', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health/ready', async (req, res) => {
  let isReady = true;
  const checks = {
    mongo: 'ok',
    redis: 'ok',
  };

  if (mongoose.connection.readyState !== 1) {
    checks.mongo = 'error';
    isReady = false;
  }

  if (redis.status !== 'ready') {
    checks.redis = 'error';
    isReady = false;
  }

  // A proper readiness probe might also ping Judge0, but basic infrastructure is sufficient here
  if (!isReady) {
    res.status(503).json({ status: 'error', checks });
  } else {
    res.status(200).json({ status: 'ok', checks });
  }
});

// Metrics Endpoint
app.get('/metrics', getMetrics);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/judge0', judge0Routes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/replays', replayRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(globalErrorHandler);

// Start Server
const replayWorker = new ReplayWorker();

httpServer.listen(port, () => {
  logger.info(`Server is running on port ${port} in ${env.NODE_ENV} mode`);
  MatchmakingEngine.start();
  replayWorker.start().catch(e => logger.error(e, 'Replay worker failed to start'));
  LeaderboardService.rebuildLeaderboard().catch(e => logger.error(e, 'Leaderboard rebuild failed'));
  seedAdmin().catch(e => logger.error(e, 'Admin seed failed'));
});

// Graceful Shutdown
const gracefulShutdown = () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully...');
  
  // 1. Stop accepting new connections
  httpServer.close(async () => {
    logger.info('HTTP server closed.');

    try {
      // 2. Stop workers
      MatchmakingEngine.stop();
      logger.info('Matchmaking engine stopped.');

      // 3. Close Socket.IO
      const io = getIO();
      if (io) {
        io.close();
        logger.info('Socket.IO connections closed.');
      }

      // 4. Close Database connections
      await mongoose.connection.close(false);
      logger.info('MongoDB connection closed.');

      await redis.quit();
      logger.info('Redis connection closed.');

      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Error during graceful shutdown');
      process.exit(1);
    }
  });
  
  // Fallback timeout in case connections hang
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
