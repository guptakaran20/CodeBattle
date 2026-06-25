import React from 'react';
import Link from 'next/link';
import { getLiveBattles } from '@/lib/api/home';

// Currently consumes mock data.
// Future implementation: Replace with lib/api/home.ts backed by REST endpoint.
// No component changes required.
export const LiveBattles = async () => {
  const battles = await getLiveBattles();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Wrong Answer': return 'text-error bg-error/10 border-error/20';
      case 'Coding': return 'text-primary bg-primary/10 border-primary/20';
      case 'Time Limit Exceeded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-on-surface-variant bg-surface-variant/30 border-surface-variant';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted': return 'check_circle';
      case 'Wrong Answer': return 'cancel';
      case 'Coding': return 'keyboard';
      case 'Time Limit Exceeded': return 'timer_off';
      default: return 'info';
    }
  };

  return (
    <section id="live-battles" className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
            </div>
            <h2 className="font-label-caps uppercase tracking-widest text-error text-sm font-bold">Live Arena</h2>
          </div>
          <h3 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface">Watch Top Gladiators</h3>
        </div>
        <Link href="/arena" className="font-label-caps text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5 group">
          View All Active Matches
          <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {battles.map((battle) => (
          <Link 
            key={battle.id} 
            href={`/battle/${battle.id}`}
            className="group bg-[#131418] border border-surface-variant rounded-2xl p-5 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(255,193,116,0.1)] transition-all flex flex-col gap-5"
          >
            {/* Top row: Status & Language */}
            <div className="flex justify-between items-center">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide ${getStatusColor(battle.status)}`}>
                <span className="material-symbols-outlined text-[14px]">{getStatusIcon(battle.status)}</span>
                {battle.status}
              </div>
              <div className="text-xs font-code-sm text-on-surface-variant bg-surface-variant/30 px-2 py-0.5 rounded">
                {battle.language}
              </div>
            </div>

            {/* Middle row: Players */}
            <div className="flex justify-between items-center px-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-surface-variant/50 border border-surface-variant flex items-center justify-center font-bold text-sm text-on-surface">
                  {battle.player1.charAt(0)}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-on-surface">{battle.player1}</span>
                  <span className="text-[10px] font-code-sm text-primary">{battle.rating1}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 opacity-60">
                <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant">VS</span>
                <span className="text-xs font-code-sm text-on-surface-variant">{battle.timer}</span>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-surface-variant/50 border border-surface-variant flex items-center justify-center font-bold text-sm text-on-surface">
                  {battle.player2.charAt(0)}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs font-semibold text-on-surface">{battle.player2}</span>
                  <span className="text-[10px] font-code-sm text-primary">{battle.rating2}</span>
                </div>
              </div>
            </div>
            
            {/* Bottom Row: Action */}
            <div className="mt-2 w-full flex items-center justify-center bg-surface-variant/20 hover:bg-primary text-on-surface-variant hover:text-on-primary py-2 rounded-xl text-xs font-bold font-label-caps uppercase tracking-wider transition-colors">
              Spectate Match
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
