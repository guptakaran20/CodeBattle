import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import http from 'http';
import { connectDB } from './config/database.js';
import { globalErrorHandler } from './common/middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import problemRoutes from './modules/problems/problem.routes.js';
import battleRoutes from './modules/battles/battle.routes.js';
import submissionRoutes from './modules/submissions/submission.routes.js';
import judge0Routes from './modules/submissions/judge0.routes.js';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes.js';
import matchmakingRoutes from './modules/matchmaking/matchmaking.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';
import replayRoutes from './modules/replays/replay.routes.js';
import tournamentRoutes from './modules/tournaments/tournament.routes.js';
import { ReplayWorker } from './workers/replay.worker.js';
import { initializeSocket } from './modules/websockets/socket.service.js';
import { MatchmakingEngine } from './modules/matchmaking/matchmaking.engine.js';
import { LeaderboardService } from './services/redis/LeaderboardService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server instead of listening directly on Express app
const httpServer = http.createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection
connectDB();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/judge0', judge0Routes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/replays', replayRoutes);
app.use('/api/tournaments', tournamentRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok', message: 'Backend is healthy' } });
});

// Error Handling Middleware
app.use(globalErrorHandler);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  MatchmakingEngine.start();
  const replayWorker = new ReplayWorker();
  replayWorker.start().catch(console.error);
  LeaderboardService.rebuildLeaderboard().catch(console.error);
});
