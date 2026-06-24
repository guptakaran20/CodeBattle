import type { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../../services/redis/LeaderboardService.js';
import { User } from '../users/user.model.js';
import { RatingService } from '../../services/ranking/RatingService.js';

export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    
    // Fetch raw ids and scores from Redis
    const topEntries = await LeaderboardService.getTopPlayers(limit);
    
    // If empty, it might not be initialized, try rebuilding (only once)
    if (topEntries.length === 0) {
      await LeaderboardService.rebuildLeaderboard();
      const retryEntries = await LeaderboardService.getTopPlayers(limit);
      if (retryEntries.length === 0) {
        return res.status(200).json({ success: true, data: { leaderboard: [] } });
      }
      topEntries.push(...retryEntries);
    }

    // Map user details from MongoDB
    const userIds = topEntries.map(e => e.userId);
    
    const users = await User.find({ _id: { $in: userIds } })
      .select('username name avatar rating wins battlesPlayed')
      .lean();

    // Map the users back to the sorted order from Redis
    const leaderboard = topEntries.map(entry => {
      const u = users.find(u => u._id.toString() === entry.userId);
      return {
        userId: entry.userId,
        rating: entry.rating,
        username: u?.username || 'Unknown',
        name: u?.name || 'Unknown',
        avatar: u?.avatar || null,
        wins: u?.wins || 0,
        battlesPlayed: u?.battlesPlayed || 0,
        streak: Math.floor(Math.random() * 15), // Mock streak for UI
        topLangs: ['CPP', 'PYTHON', 'JAVA', 'RUST', 'GO'].sort(() => 0.5 - Math.random()).slice(0, 2) // Mock langs
      };
    });

    return res.status(200).json({ success: true, data: { leaderboard } });
  } catch (error) {
    next(error);
  }
};

export const getRanks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ranks = RatingService.getRankBoundaries();
    return res.status(200).json({ success: true, data: { ranks } });
  } catch (error) {
    next(error);
  }
};
