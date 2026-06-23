import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { MatchmakingService } from '../../services/redis/MatchmakingService.js';
import type { Difficulty } from '../../services/redis/MatchmakingService.js';
import { redis } from '../../config/redis.js';
import { getIO } from '../websockets/socket.service.js';
import { SocketEvents } from '../websockets/events.js';
import { User } from '../users/user.model.js';

export const MatchmakingController = {
  joinQueue: async (req: Request, res: Response) => {
    try {
      const { difficulty } = req.body;
      if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        return res.status(400).json({ success: false, message: 'Invalid difficulty' });
      }

      const userId = (req as AuthenticatedRequest).user.id;
      
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
  },

  challengeUser: async (req: Request, res: Response) => {
    try {
      const { targetUsername } = req.body;
      const senderId = (req as AuthenticatedRequest).user.id;
      const senderObj = (req as AuthenticatedRequest).user as any;

      if (!targetUsername) {
        return res.status(400).json({ success: false, message: 'Username required' });
      }

      const targetUser = await User.findOne({ username: targetUsername });
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const targetId = targetUser._id.toString();
      if (senderId === targetId) {
        return res.status(400).json({ success: false, message: 'Cannot challenge yourself' });
      }

      const challengeId = `challenge:${Math.random().toString(36).substring(2, 9)}`;
      
      // Store challenge in Redis with 5min TTL
      await redis.setex(challengeId, 300, JSON.stringify({
        senderId,
        senderUsername: senderObj.username || 'User',
        targetId
      }));

      // Emit to target user
      const io = getIO();
      io?.to(`user_${targetId}`).emit(SocketEvents.CHALLENGE_RECEIVED, {
        challengeId,
        senderUsername: senderObj.username || 'User'
      });

      res.status(200).json({ success: true, message: 'Challenge sent' });
    } catch (error) {
      console.error('Challenge error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  acceptChallenge: async (req: Request, res: Response) => {
    try {
      const { challengeId } = req.params;
      const targetId = (req as AuthenticatedRequest).user.id;

      const data = await redis.get(challengeId as string);
      if (!data) {
        return res.status(400).json({ success: false, message: 'Challenge expired or invalid' });
      }

      const challenge = JSON.parse(data);
      if (challenge.targetId !== targetId) {
        return res.status(403).json({ success: false, message: 'Not your challenge' });
      }

      // Delete challenge so it can't be reused
      await redis.del(challengeId as string);

      const io = getIO();
      io?.to(`user_${challenge.senderId}`).emit(SocketEvents.CHALLENGE_ACCEPTED, { challengeId });

      // In the frontend, the accepting user might create the battle and redirect both,
      // OR we create the battle right here (better for security).
      // For now, since BattleController handles custom battle creation, we can let frontend redirect or call Battle creation.
      // Wait, we can just return success and let the client hit /api/battles to create it, or create it here.
      // Actually, creating it here is faster. We need a Problem though. 
      // For MVP of challenges, let's just return success, and the frontend can route to Custom Battle Creation.

      res.status(200).json({ success: true, message: 'Challenge accepted' });
    } catch (error) {
      console.error('Accept challenge error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};
