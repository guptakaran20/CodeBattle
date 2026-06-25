import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { MatchmakingService } from '../../services/redis/MatchmakingService.js';
import type { Difficulty } from '../../services/redis/MatchmakingService.js';
import { redis } from '../../config/redis.js';
import { getIO } from '../websockets/socket.service.js';
import { SocketEvents } from '../websockets/events.js';
import { User } from '../users/user.model.js';
import { Battle } from '../battles/battle.model.js';

export const MatchmakingController = {
  joinQueue: async (req: Request, res: Response) => {
    try {
      const { difficulty } = req.body;
      const userId = (req as AuthenticatedRequest).user.id;
      const userObj = (req as AuthenticatedRequest).user as any;

      if (!difficulty || !['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return res.status(400).json({ success: false, message: 'Invalid difficulty' });
      }

      // Check if user is already in an active battle
      const activeBattle = await Battle.findOne({
        'teams.members': userId,
        status: { $in: ['WAITING', 'IN_PROGRESS'] }
      });

      if (activeBattle) {
        return res.status(400).json({ success: false, message: 'You are already in an active battle.' });
      }
      
      // Prevent double queuing
      const existingState = await MatchmakingService.getPlayerState(userId);
      if (existingState) {
        return res.status(400).json({ success: false, message: 'Already in queue' });
      }

      // We should ideally use the actual user Elo here, default 1500 if not found
      const user = await User.findById(userId).select('rating');
      const elo = user?.rating || 1500;

      await MatchmakingService.joinQueue(userId, elo, difficulty as Difficulty);

      const io = getIO();
      io?.to(`user_${userId}`).emit(SocketEvents.QUEUE_JOINED, { difficulty });

      res.status(200).json({ success: true, message: 'Joined queue successfully' });
    } catch (error) {
      console.error('Join queue error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  leaveQueue: async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      
      await MatchmakingService.leaveQueue(userId);

      const io = getIO();
      io?.to(`user_${userId}`).emit(SocketEvents.QUEUE_LEFT, {});

      res.status(200).json({ success: true, message: 'Left queue successfully' });
    } catch (error) {
      console.error('Leave queue error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
