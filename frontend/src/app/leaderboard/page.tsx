"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface LeaderboardPlayer {
  userId: string;
  rating: number;
  username: string;
  name: string;
  avatar: string | null;
  wins: number;
  battlesPlayed: number;
  streak: number;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard?limit=100');
        if (res.data.success) {
          setPlayers(res.data.data.leaderboard);
        }
      } catch (error) {
        console.error('Failed to load leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-400 border-amber-400/50 bg-amber-400/10 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
    if (rank === 2) return 'text-slate-300 border-slate-300/50 bg-slate-300/10 shadow-[0_0_15px_rgba(203,213,225,0.2)]';
    if (rank === 3) return 'text-amber-700 border-amber-700/50 bg-amber-700/10 shadow-[0_0_15px_rgba(180,83,9,0.2)]';
    return 'text-on-surface-variant border-surface-variant bg-surface-container';
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-48 md:h-56';
    if (rank === 2) return 'h-40 md:h-48';
    if (rank === 3) return 'h-32 md:h-40';
    return 'h-24';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const top3 = [players[1], players[0], players[2]].filter(Boolean);
  const rest = players.slice(3);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">Global Leaderboard</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto">The most elite gladiators in the Arena. Rankings are calculated using a strict Elo rating system after every battle.</p>
      </div>

      {/* Podium Section */}
      {top3.length > 0 && (
        <div className="flex justify-center items-end gap-2 md:gap-6 mb-24 px-2 mt-16">
          {top3.map((player, idx) => {
            let rank = 2;
            if (idx === 1) rank = 1;
            if (idx === 2) rank = 3;

            return (
              <div key={player.userId} className={`flex flex-col items-center w-28 md:w-40 relative group`}>
                <div className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-2 pb-3 w-full">
                  <div className={`w-14 h-14 md:w-20 md:h-20 rounded-full border-2 ${getRankColor(rank).split(' ')[1]} flex items-center justify-center font-bold text-2xl uppercase bg-surface-container overflow-hidden`}>
                    {player.avatar ? <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" /> : player.username.charAt(0)}
                  </div>
                  <Link href={`/u/${player.username}`} className="mt-2 font-bold text-sm md:text-base text-on-surface hover:text-primary transition-colors truncate w-full text-center">
                    {player.username}
                  </Link>
                  <div className="text-xs md:text-sm font-code-sm text-primary font-bold mt-1">{player.rating} RTG</div>
                </div>
                
                <div className={`w-full ${getPodiumHeight(rank)} ${getRankColor(rank)} border-t-2 border-l border-r rounded-t-xl flex justify-center items-start pt-4 transition-all duration-300 group-hover:brightness-110`}>
                  <span className="font-headline font-black text-3xl md:text-5xl opacity-80">#{rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Rankings Table */}
      {rest.length > 0 && (
        <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-high border-b border-surface-variant">
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant tracking-widest uppercase">Rank</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant tracking-widest uppercase">Gladiator</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant tracking-widest uppercase text-right">Win Rate</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant tracking-widest uppercase text-right">Battles</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-primary tracking-widest uppercase text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {rest.map((player, i) => {
                  const rank = i + 4;
                  const winRate = player.battlesPlayed > 0 ? Math.round((player.wins / player.battlesPlayed) * 100) : 0;
                  return (
                    <tr key={player.userId} className="hover:bg-surface-container-high transition-colors">
                      <td className="py-4 px-6 text-on-surface-variant font-code-sm">#{rank}</td>
                      <td className="py-4 px-6">
                        <Link href={`/u/${player.username}`} className="flex items-center gap-3 group">
                          <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-xs font-bold uppercase overflow-hidden border border-surface-variant group-hover:border-primary transition-colors">
                            {player.avatar ? <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" /> : player.username.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{player.username}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-right text-sm text-on-surface-variant">{winRate}%</td>
                      <td className="py-4 px-6 text-right text-sm text-on-surface-variant">{player.battlesPlayed}</td>
                      <td className="py-4 px-6 text-right font-code-sm text-primary font-bold">{player.rating}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-24 bg-surface-container rounded-xl border border-surface-variant mt-8">
          <div className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">sports_score</div>
          <h3 className="text-xl font-bold text-on-surface mb-2">No Gladiators Yet</h3>
          <p className="text-on-surface-variant">The arena is empty. Be the first to battle!</p>
        </div>
      )}
    </div>
  );
}
