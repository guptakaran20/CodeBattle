import React from 'react';
import Link from 'next/link';
import { getTopPlayers } from '@/lib/api/home';

export const LeaderboardPreview = async () => {
  const topPlayers = await getTopPlayers();

  return (
    <section id="leaderboard" className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-end">
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Top Gladiators</h2>
        <Link href="/leaderboard" className="font-label-caps text-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 font-bold uppercase tracking-widest">
          Full Leaderboard <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
      
      <div className="bg-surface-container-low border border-surface-variant rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-variant bg-surface-container-highest">
                <th className="py-4 px-6 font-label-caps text-xs text-on-surface-variant w-20 text-center uppercase tracking-widest font-bold">Rank</th>
                <th className="py-4 px-6 font-label-caps text-xs text-on-surface-variant uppercase tracking-widest font-bold">Player</th>
                <th className="py-4 px-6 font-label-caps text-xs text-on-surface-variant text-right uppercase tracking-widest font-bold">Rating</th>
                <th className="py-4 px-6 font-label-caps text-xs text-on-surface-variant text-right hidden sm:table-cell uppercase tracking-widest font-bold">Win Rate</th>
              </tr>
            </thead>
            <tbody className="font-code-sm text-sm">
              {topPlayers.map((player) => (
                <tr key={player.rank} className="border-b border-surface-variant hover:bg-surface-container-high transition-colors group">
                  <td className="py-4 px-6 text-center">
                    <span className={`font-bold ${player.rank <= 3 ? 'text-primary' : 'text-on-surface-variant'}`}>
                      #{player.rank}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-on-surface font-body-sm flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      player.rank === 1 ? 'bg-primary/20 border-2 border-primary text-primary' :
                      player.rank === 2 ? 'bg-zinc-300/20 border-2 border-zinc-300 text-zinc-300' :
                      player.rank === 3 ? 'bg-amber-700/20 border-2 border-amber-700 text-amber-700' :
                      'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {player.username.substring(0, 1).toUpperCase()}
                    </div>
                    <span className="font-bold group-hover:text-primary transition-colors">{player.username}</span>
                  </td>
                  <td className="py-4 px-6 text-on-surface text-right font-bold text-base">{player.rating}</td>
                  <td className="py-4 px-6 text-right hidden sm:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-on-surface-variant">{player.winRate}%</span>
                      {player.trend === 'up' ? (
                        <span className="material-symbols-outlined text-[16px] text-emerald-500">trending_up</span>
                      ) : player.trend === 'down' ? (
                        <span className="material-symbols-outlined text-[16px] text-red-500">trending_down</span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">remove</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
