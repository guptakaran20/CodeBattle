import { platformStats, PlatformStats } from '../mock/platformStats';
import { liveBattles, LiveBattle } from '../mock/liveBattles';
import { topPlayers, TopPlayer } from '../mock/leaderboard';

export const getPlatformStats = async (): Promise<PlatformStats> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return platformStats;
};

export const getLiveBattles = async (): Promise<LiveBattle[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return liveBattles;
};

export const getTopPlayers = async (): Promise<TopPlayer[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    const res = await fetch(`${apiUrl}/leaderboard?limit=5`, { next: { revalidate: 60 } });
    const data = await res.json();
    
    if (data.success && data.data && data.data.leaderboard) {
      return data.data.leaderboard.map((user: any, index: number) => {
        const winRate = user.battlesPlayed > 0 ? Math.round((user.wins / user.battlesPlayed) * 100) : 0;
        return {
          rank: index + 1,
          username: user.username,
          rating: user.rating,
          winRate: winRate,
          trend: 'same' // We can keep mock trend since backend doesn't provide historical trend yet
        };
      });
    }
  } catch (error) {
    console.error('Failed to fetch real top players, falling back to mock data:', error);
  }

  // Fallback to mock data if backend fails
  return topPlayers;
};
