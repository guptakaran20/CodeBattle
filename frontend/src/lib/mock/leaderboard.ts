export interface TopPlayer {
  rank: number;
  username: string;
  rating: number;
  winRate: number;
  avatarUrl?: string;
  country?: string;
  trend: 'up' | 'down' | 'same';
}

export const topPlayers: TopPlayer[] = [
  {
    rank: 1,
    username: "void_pointer",
    rating: 3420,
    winRate: 89,
    trend: 'same'
  },
  {
    rank: 2,
    username: "bit_shifter",
    rating: 3395,
    winRate: 86,
    trend: 'up'
  },
  {
    rank: 3,
    username: "algo_rythm",
    rating: 3310,
    winRate: 84,
    trend: 'up'
  },
  {
    rank: 4,
    username: "null_sec",
    rating: 3280,
    winRate: 82,
    trend: 'down'
  },
  {
    rank: 5,
    username: "root_user",
    rating: 3245,
    winRate: 81,
    trend: 'same'
  }
];
