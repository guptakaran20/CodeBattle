import React from 'react';
import Link from 'next/link';

export const TournamentPreview = () => {
  return (
    <section className="flex flex-col gap-6 w-full py-12">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h2 className="font-label-caps uppercase tracking-widest text-primary text-sm font-bold">Compete & Win</h2>
          <h3 className="font-headline-lg text-3xl font-bold text-on-surface">Upcoming Tournaments</h3>
        </div>
        <Link href="/tournaments" className="font-label-caps text-sm text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 font-bold uppercase tracking-widest mb-1">
          View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>

      <div className="relative w-full rounded-3xl overflow-hidden group border border-surface-variant bg-surface-container-low shadow-xl">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-[#131418] to-[#1c1d21] -z-10"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>

        <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 relative z-10">
          
          <div className="flex flex-col gap-6 w-full md:w-2/3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 font-label-caps text-xs uppercase tracking-widest rounded flex items-center gap-2 font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Registration Open
              </span>
              <span className="px-3 py-1 bg-surface-variant border border-surface-variant-hover text-on-surface-variant font-label-caps text-xs uppercase tracking-widest rounded flex items-center gap-1 font-bold">
                <span className="material-symbols-outlined text-[14px]">calendar_month</span> Oct 15 - 20
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-headline-lg text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight">CodeArena Global Championship 2026</h4>
              <p className="font-body-md text-on-surface-variant text-lg leading-relaxed max-w-2xl">
                The ultimate 5-day algorithmic showdown. Compete against top developers worldwide, climb the bracket, and claim the undisputed title of Grandmaster.
              </p>
            </div>

            <div className="flex items-center gap-8 mt-2">
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant font-bold">Prize Pool</span>
                <span className="font-headline-md text-2xl font-bold text-amber-400 flex items-center gap-1">
                  <span className="material-symbols-outlined">payments</span> $50,000
                </span>
              </div>
              <div className="w-[1px] h-12 bg-surface-variant"></div>
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-xs uppercase tracking-widest text-on-surface-variant font-bold">Registered</span>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface-container-low flex items-center justify-center font-bold text-[10px] text-on-surface">V</div>
                    <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface-container-low flex items-center justify-center font-bold text-[10px] text-on-surface">B</div>
                    <div className="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface-container-low flex items-center justify-center font-bold text-[10px] text-on-surface">A</div>
                  </div>
                  <span className="font-headline-md text-xl font-bold text-on-surface">4,208 <span className="text-sm font-normal text-on-surface-variant">Players</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/3 flex flex-col items-center md:items-end justify-center gap-4">
            <Link href="/tournaments/global-2026" className="w-full sm:w-auto bg-primary hover:bg-primary-fixed text-on-primary font-label-caps text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold shadow-[0_0_20px_rgba(255,193,116,0.3)] hover:shadow-[0_0_30px_rgba(255,193,116,0.5)] hover:-translate-y-1">
              Join Tournament <span className="material-symbols-outlined">how_to_reg</span>
            </Link>
            <span className="font-body-sm text-xs text-on-surface-variant">Closes in 4 days, 12 hours</span>
          </div>

        </div>
      </div>
    </section>
  );
};
