import React from 'react';
import { getPlatformStats } from '@/lib/api/home';

// Currently consumes mock data.
// Future implementation: Replace with lib/api/home.ts backed by REST endpoint.
// No component changes required.
export const Stats = async () => {
  const stats = await getPlatformStats();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      <div className="bg-[#131418]/80 backdrop-blur-md border border-surface-variant p-6 rounded-2xl flex flex-col items-center sm:items-start gap-1 transition-all hover:border-primary/30 hover:bg-[#131418]">
        <span className="font-label-caps text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Players Online</span>
        <span className="font-headline-lg text-2xl sm:text-3xl font-bold font-code-md text-primary tracking-tight">{stats.playersOnline.toLocaleString()}</span>
      </div>
      <div className="bg-[#131418]/80 backdrop-blur-md border border-surface-variant p-6 rounded-2xl flex flex-col items-center sm:items-start gap-1 transition-all hover:border-primary/30 hover:bg-[#131418]">
        <span className="font-label-caps text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Battles Today</span>
        <span className="font-headline-lg text-2xl sm:text-3xl font-bold font-code-md text-primary tracking-tight">{stats.battlesToday.toLocaleString()}</span>
      </div>
      <div className="bg-[#131418]/80 backdrop-blur-md border border-surface-variant p-6 rounded-2xl flex flex-col items-center sm:items-start gap-1 transition-all hover:border-primary/30 hover:bg-[#131418]">
        <span className="font-label-caps text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Problems Solved</span>
        <span className="font-headline-lg text-2xl sm:text-3xl font-bold font-code-md text-primary tracking-tight">{formatNumber(stats.problemsSolved)}</span>
      </div>
      <div className="bg-[#131418]/80 backdrop-blur-md border border-surface-variant p-6 rounded-2xl flex flex-col items-center sm:items-start gap-1 transition-all hover:border-primary/30 hover:bg-[#131418]">
        <span className="font-label-caps text-[10px] sm:text-xs uppercase tracking-widest text-on-surface-variant">Top Rating</span>
        <span className="font-headline-lg text-2xl sm:text-3xl font-bold font-code-md text-primary tracking-tight">{stats.topRating.toLocaleString()}</span>
      </div>
    </section>
  );
};
