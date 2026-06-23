import type { Request, Response, NextFunction } from 'express';
import { LeaderboardService } from '../../services/redis/LeaderboardService.js';
import { User } from '../users/user.model.js';

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
      .select('username name avatar elo')
      .lean();

    // Map the users back to the sorted order from Redis
    const leaderboard = topEntries.map(entry => {
      const u = users.find(u => u._id.toString() === entry.userId);
      return {
        userId: entry.userId,
        elo: entry.elo,
        username: u?.username || 'Unknown',
        name: u?.name || 'Unknown',
        avatar: u?.avatar || null
      };
    });

    return res.status(200).json({ success: true, data: { leaderboard } });
  } catch (error) {
    next(error);
  }
};
