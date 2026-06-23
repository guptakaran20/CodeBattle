"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';

export default function Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { setSidebarVisible } = useUI();
  const router = useRouter();

  // Protect route
  useEffect(() => {
    // Leaderboard is public, no auth redirect needed here
  }, []);

  // Hide sidebar
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(true);
  }, [setSidebarVisible]);

  // Fetch data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        if (res.data.success) {
          setLeaderboard(res.data.data?.leaderboard || []);
        }
      } catch (e) {
        console.error('Failed to load leaderboard', e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const calculateWinRate = (wins: number, played: number) => {
    if (!played || played === 0) return 0;
    return Math.round((wins / played) * 100);
  };

  const getRankBadge = (rank: number) => {
    return rank.toString().padStart(2, '0');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-on-surface flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-16 animate-in fade-in duration-700">
        
        {/* Header (No Subtitle, No Filters as requested) */}
        <div className="flex flex-col items-start gap-2 pt-6">
          <h1 className="text-4xl font-headline-lg font-bold text-on-surface">Global Leaderboard</h1>
        </div>

        {/* Top 3 Podium */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 pt-8">
          {loading ? (
            [2, 1, 3].map(i => <Skeleton key={i} className={`w-full md:w-72 bg-surface border-surface-variant ${i===1 ? 'h-[26rem]' : 'h-96'}`} />)
          ) : (
            <>
              {/* Rank 2 (Silver) */}
              {leaderboard[1] && (
                <div className="w-full md:w-80 bg-surface border border-surface-variant rounded-xl flex flex-col items-center py-10 order-2 md:order-1 relative mt-12 md:mt-16">
                  {/* Badge */}
                  <div className="absolute -top-6 bg-surface border-2 border-surface-variant text-surface-variant-bright w-14 h-14 rounded-full flex items-center justify-center font-headline-lg font-bold text-2xl shadow-lg">
                    <span className="bg-gradient-to-b from-slate-300 to-slate-500 bg-clip-text text-transparent">2</span>
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-surface-variant p-1 mt-4 mb-6 shadow-[0_0_20px_rgba(148,163,184,0.15)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface-container flex items-center justify-center border-2 border-slate-400">
                       {leaderboard[1].avatar ? (
                         <img src={leaderboard[1].avatar} alt={leaderboard[1].username} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-2xl font-bold text-slate-400">{leaderboard[1].username.charAt(0).toUpperCase()}</span>
                       )}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold font-headline-lg mb-2">{leaderboard[1].username}</h2>
                  <div className="flex items-center gap-2 text-on-surface-variant font-code-sm mb-6">
                    <span className="material-symbols-outlined text-[16px] text-slate-300">diamond</span>
                    <span><span className="text-on-surface font-bold">{leaderboard[1].rating.toLocaleString()}</span> ELO</span>
                  </div>

                  <div className="flex gap-3 mb-8">
                    {(leaderboard[1].topLangs || []).map((lang: string) => (
                      <span key={lang} className="px-3 py-1 bg-surface-container border border-surface-variant rounded text-[10px] font-label-caps tracking-widest text-on-surface-variant">
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="w-full flex justify-around px-8 border-t border-surface-variant pt-6">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant mb-1">WINS</span>
                        <span className="font-code-md text-lg text-on-surface">{leaderboard[1].wins || 0}</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant mb-1">STREAK</span>
                        <div className="flex items-center gap-1">
                          <span className="font-code-md text-lg text-primary">{leaderboard[1].streak || 0}</span>
                          <span className="text-orange-500">🔥</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}
              
              {/* Rank 1 (Gold) */}
              {leaderboard[0] && (
                <div className="w-full md:w-96 bg-surface border-t-2 border-[#ffc174] border-x border-b border-surface-variant rounded-xl flex flex-col items-center py-12 order-1 md:order-2 relative shadow-[0_0_40px_rgba(255,193,116,0.05)]">
                  {/* Gold Glow Top */}
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#ffc174]/10 to-transparent rounded-t-xl" />
                  
                  {/* Badge */}
                  <div className="absolute -top-8 bg-surface border-2 border-[#ffc174]/50 text-[#ffc174] w-20 h-20 rounded-full flex items-center justify-center font-headline-lg font-bold text-4xl shadow-[0_0_20px_rgba(255,193,116,0.2)]">
                    <span className="bg-gradient-to-b from-[#ffefdb] to-[#ffc174] bg-clip-text text-transparent">1</span>
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-32 h-32 rounded-full bg-surface-variant p-1 mt-6 mb-6 shadow-[0_0_30px_rgba(255,193,116,0.2)] relative z-10">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface-container flex items-center justify-center border-2 border-[#ffc174]">
                       {leaderboard[0].avatar ? (
                         <img src={leaderboard[0].avatar} alt={leaderboard[0].username} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-3xl font-bold text-[#ffc174]">{leaderboard[0].username.charAt(0).toUpperCase()}</span>
                       )}
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold font-headline-lg mb-2 relative z-10">{leaderboard[0].username}</h2>
                  <div className="flex items-center gap-2 text-[#ffc174] font-code-sm mb-6 relative z-10">
                    <span className="material-symbols-outlined text-[18px]">diamond</span>
                    <span><span className="font-bold text-lg">{leaderboard[0].rating.toLocaleString()}</span> ELO</span>
                  </div>

                  <div className="flex gap-3 mb-10 relative z-10">
                    {(leaderboard[0].topLangs || []).map((lang: string) => (
                      <span key={lang} className="px-3 py-1 bg-surface-container border border-surface-variant rounded text-[10px] font-label-caps tracking-widest text-on-surface-variant">
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="w-full flex justify-around px-8 border-t border-surface-variant pt-6 relative z-10">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant mb-1">WINS</span>
                        <span className="font-code-md text-xl text-on-surface">{leaderboard[0].wins || 0}</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant mb-1">STREAK</span>
                        <div className="flex items-center gap-1">
                          <span className="font-code-md text-xl text-primary">{leaderboard[0].streak || 0}</span>
                          <span className="text-orange-500">🔥</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {leaderboard[2] && (
                <div className="w-full md:w-80 bg-surface border border-surface-variant rounded-xl flex flex-col items-center py-10 order-3 md:order-3 relative mt-12 md:mt-16">
                  {/* Badge */}
                  <div className="absolute -top-6 bg-surface border-2 border-surface-variant text-surface-variant-bright w-14 h-14 rounded-full flex items-center justify-center font-headline-lg font-bold text-2xl shadow-lg">
                    <span className="bg-gradient-to-b from-amber-600 to-amber-800 bg-clip-text text-transparent">3</span>
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-full bg-surface-variant p-1 mt-4 mb-6 shadow-[0_0_20px_rgba(217,119,6,0.1)]">
                    <div className="w-full h-full rounded-full overflow-hidden bg-surface-container flex items-center justify-center border-2 border-amber-700">
                       {leaderboard[2].avatar ? (
                         <img src={leaderboard[2].avatar} alt={leaderboard[2].username} className="w-full h-full object-cover" />
                       ) : (
                         <span className="text-2xl font-bold text-amber-700">{leaderboard[2].username.charAt(0).toUpperCase()}</span>
                       )}
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold font-headline-lg mb-2">{leaderboard[2].username}</h2>
                  <div className="flex items-center gap-2 text-on-surface-variant font-code-sm mb-6">
                    <span className="material-symbols-outlined text-[16px] text-primary">diamond</span>
                    <span><span className="text-on-surface font-bold">{leaderboard[2].rating.toLocaleString()}</span> ELO</span>
                  </div>

                  <div className="flex gap-3 mb-8">
                    {(leaderboard[2].topLangs || []).map((lang: string) => (
                      <span key={lang} className="px-3 py-1 bg-surface-container border border-surface-variant rounded text-[10px] font-label-caps tracking-widest text-on-surface-variant">
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="w-full flex justify-around px-8 border-t border-surface-variant pt-6">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant mb-1">WINS</span>
                        <span className="font-code-md text-lg text-on-surface">{leaderboard[2].wins || 0}</span>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant mb-1">STREAK</span>
                        <div className="flex items-center gap-1">
                          <span className="font-code-md text-lg text-primary">{leaderboard[2].streak || 0}</span>
                          <span className="text-orange-500">🔥</span>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Rest of Leaderboard Table */}
        <div className="bg-[#0e0e11] border border-surface-variant rounded-xl overflow-hidden mt-16">
          <div className="grid grid-cols-12 px-8 py-5 border-b border-surface-variant text-[11px] font-label-caps text-on-surface-variant uppercase tracking-widest">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Gladiator</div>
            <div className="col-span-3 text-center">Rating (ELO)</div>
            <div className="col-span-3 text-center">Win Rate</div>
            <div className="col-span-1 text-right">Top Lang</div>
          </div>
          <div className="divide-y divide-surface-variant/50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-6 grid grid-cols-12"><Skeleton className="col-span-12 h-6 bg-surface-variant" /></div>
              ))
            ) : (
              leaderboard.slice(3).map((lbUser, idx) => {
                const rank = idx + 4;
                const isCurrentUser = user && user.id === lbUser.userId;
                const winRate = calculateWinRate(lbUser.wins, lbUser.battlesPlayed);
                const topLang = (lbUser.topLangs && lbUser.topLangs.length > 0) ? lbUser.topLangs[0] : '--';
                
                return (
                  <div key={idx} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-surface-variant/20 transition-colors">
                    {/* Rank */}
                    <div className={`col-span-1 font-code-md font-bold ${isCurrentUser ? 'text-[#ffc174]' : 'text-on-surface-variant'}`}>
                      {getRankBadge(rank)}
                    </div>
                    
                    {/* Gladiator */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container flex items-center justify-center border border-surface-variant">
                         {lbUser.avatar ? (
                           <img src={lbUser.avatar} alt={lbUser.username} className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-xs font-bold text-on-surface-variant">{lbUser.username.charAt(0).toUpperCase()}</span>
                         )}
                      </div>
                      <span className={`font-semibold ${isCurrentUser ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                         {lbUser.username} {isCurrentUser && '(Current)'}
                      </span>
                    </div>
                    
                    {/* Rating */}
                    <div className="col-span-3 text-center font-code-md font-bold text-primary">
                      {lbUser.rating.toLocaleString()}
                    </div>
                    
                    {/* Win Rate */}
                    <div className="col-span-3 px-4 flex flex-col items-center gap-1.5">
                       <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                          <div className="h-full bg-[#ffc174]" style={{ width: `${winRate}%` }} />
                       </div>
                       <span className="text-[11px] font-code-sm text-on-surface-variant">{winRate}%</span>
                    </div>
                    
                    {/* Top Lang */}
                    <div className="col-span-1 text-right font-code-sm text-[11px] text-on-surface-variant uppercase tracking-wider">
                      {topLang}
                    </div>
                  </div>
                );
              })
            )}
            
            {!loading && leaderboard.length <= 3 && (
               <div className="p-12 text-center text-on-surface-variant italic">
                  Not enough gladiators ranked yet.
               </div>
            )}
          </div>
          
          {!loading && leaderboard.length > 3 && (
            <div className="w-full py-5 border-t border-surface-variant text-center cursor-pointer hover:bg-surface-variant/20 transition-colors">
               <span className="text-[11px] font-label-caps uppercase tracking-widest text-[#ffc174] font-bold">Load More Gladiators ⌄</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-surface-variant py-8 px-8 bg-[#0a0a0c]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
               <div className="font-headline-lg font-bold text-lg">CODEARENA</div>
               <div className="text-xs font-code-sm text-on-surface-variant">© 2024 CodeArena. All rights reserved.</div>
            </div>
            <div className="flex items-center gap-6 text-[11px] font-code-sm text-on-surface-variant">
               <a href="#" className="hover:text-on-surface transition-colors">System Status</a>
               <a href="#" className="hover:text-on-surface transition-colors">Terms</a>
               <a href="#" className="hover:text-on-surface transition-colors">Privacy</a>
               <a href="#" className="hover:text-on-surface transition-colors">Security</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
