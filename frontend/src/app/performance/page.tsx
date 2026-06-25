"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerformancePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ rating: 1500, battlesWon: 0, totalBattles: 0, losses: 0, winRate: 0, rank: 'Guest' });
  const [recentBattles, setRecentBattles] = useState<any[]>([]);
  const [trajectory, setTrajectory] = useState<number[]>([50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
  const [monthlyDelta, setMonthlyDelta] = useState<number>(0);

  const getRank = (elo: number) => {
    if (elo < 1200) return 'Novice';
    if (elo < 1500) return 'Apprentice';
    if (elo < 1800) return 'Pro';
    if (elo < 2100) return 'Master';
    return 'Grandmaster';
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!isAuthenticated) return;
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/battles')
        ]);
        if (profileRes.data.success) {
          const userObj = profileRes.data.data.user || {};
          const wins = userObj.wins || 0;
          const total = userObj.battlesPlayed || 0;
          const losses = userObj.losses || 0;
          const winRate = total ? Math.round((wins / total) * 100) : 0;
          const elo = userObj.rating || 1500;
          
          setStats({
            rating: elo,
            battlesWon: wins,
            totalBattles: total,
            losses,
            winRate,
            rank: getRank(elo)
          });
        }
        if (historyRes.data.success) {
          const battles = historyRes.data.data.battles || [];
          setRecentBattles(battles);

          // Calculate Dynamic Trajectory
          const currentR = profileRes.data.data.user?.rating || 1500;
          const uId = profileRes.data.data.user?._id || profileRes.data.data.user?.id;
          const points = [currentR];
          let delta = 0;
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

          const sortedBattles = [...battles]
            .filter(b => b.status === 'COMPLETED')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          for (const b of sortedBattles) {
            let isWin = false;
            let isDraw = false;
            if (b.winner === uId) isWin = true;
            else if (b.winner && b.winner._id === uId) isWin = true;
            else if (b.teams) {
              const myTeam = b.teams.find((t: any) => t.members.includes(uId) || t.members.some((m: any) => m._id === uId));
              if (myTeam && b.result?.winningTeamId === myTeam.teamId) isWin = true;
              else if (!b.winner && !b.result?.winningTeamId) isDraw = true;
            }

            const change = isWin ? 15 : (isDraw ? 0 : -15);
            const prev = points[points.length - 1] - change;
            points.push(prev);

            if (new Date(b.createdAt) >= thirtyDaysAgo) {
              delta += change;
            }

            if (points.length >= 10) break;
          }

          while (points.length < 10) points.push(points[points.length - 1]);
          points.reverse();

          const minR = Math.min(...points) - 50;
          const maxR = Math.max(...points) + 50;
          const range = maxR - minR || 100;
          
          setTrajectory(points.map(p => Math.max(15, ((p - minR) / range) * 100)));
          setMonthlyDelta(delta);
        }
      } catch (e) {
        console.error('Failed to load dashboard', e);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchDashboard();
  }, [isAuthenticated]);

  const isSkeleton = authLoading || loading || !isAuthenticated;
  
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center items-center font-body-md">
         You must be logged in to view your performance.
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-8 pt-24 space-y-8 animate-in fade-in duration-500 font-body-md text-on-surface">
      <div className="flex items-center justify-between border-b border-surface-variant pb-6 mb-6">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] font-bold tracking-tight text-on-surface">Performance</h1>
          <p className="font-body-md text-on-surface-variant">Detailed telemetry and statistics of your arena engagements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Core Stats */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-surface-container border border-surface-variant rounded-xl p-6 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 rounded-full bg-surface-variant border border-surface-bright flex items-center justify-center overflow-hidden mb-4 shadow-[0_0_20px_rgba(255,193,116,0.15)]">
               {isSkeleton ? <Skeleton className="w-full h-full" /> : (
                 user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="font-headline-lg text-3xl font-bold text-primary uppercase">{user?.username?.charAt(0) || 'D'}</span>
               )}
             </div>
             <h2 className="font-headline-lg text-2xl font-bold mb-1">{user?.username || 'Guest'}</h2>
             <span className="font-label-caps text-xs tracking-widest uppercase text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full mb-6">
               {stats.rank}
             </span>
             
             <div className="w-full grid grid-cols-2 gap-4 border-t border-surface-variant pt-6">
               <div>
                 <div className="font-label-caps text-xs text-on-surface-variant mb-1">CURRENT ELO</div>
                 <div className="font-headline text-3xl text-primary font-bold">{stats.rating}</div>
               </div>
               <div>
                 <div className="font-label-caps text-xs text-on-surface-variant mb-1">WIN RATE</div>
                 <div className="font-headline text-3xl text-emerald-400 font-bold">{stats.winRate}%</div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center text-center">
               <span className="font-label-caps text-xs font-semibold tracking-widest text-on-surface-variant mb-1">Total Battles</span>
               <div className="font-headline text-2xl font-bold text-on-surface">{stats.totalBattles}</div>
             </div>
             <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center text-center">
               <span className="font-label-caps text-xs font-semibold tracking-widest text-on-surface-variant mb-1">Victories</span>
               <div className="font-headline text-2xl font-bold text-emerald-400">{stats.battlesWon}</div>
             </div>
             <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center text-center">
               <span className="font-label-caps text-xs font-semibold tracking-widest text-on-surface-variant mb-1">Defeats</span>
               <div className="font-headline text-2xl font-bold text-error">{stats.losses}</div>
             </div>
             <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center text-center">
               <span className="font-label-caps text-xs font-semibold tracking-widest text-on-surface-variant mb-1">Month Delta</span>
               <div className={`font-headline text-2xl font-bold ${monthlyDelta >= 0 ? 'text-emerald-400' : 'text-error'}`}>
                 {monthlyDelta > 0 ? '+' : ''}{monthlyDelta}
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Graphs & Data */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-surface-container border border-surface-variant rounded-xl p-6 shadow-lg h-[320px] flex flex-col">
            <h2 className="font-headline-lg text-lg font-bold text-on-surface mb-6">Elo Rating Trajectory (Last 10 Battles)</h2>
            <div className="flex-1 flex items-end justify-between gap-2">
              {trajectory.map((h, i) => (
                <div key={i} className="flex-1 flex justify-center h-full items-end group relative">
                  <div 
                    className={`w-full max-w-[50px] rounded-t-sm transition-all duration-500 ${i >= trajectory.length - 2 ? 'bg-[#ffc174] shadow-[0_0_15px_rgba(255,193,116,0.1)]' : 'bg-surface-variant hover:bg-surface-bright'}`}
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-surface-container border border-surface-variant rounded-xl p-6">
             <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-lg text-lg font-bold text-on-surface">Recent Engagements</h2>
                <Link href="/history" className="text-primary hover:text-primary-fixed font-label-caps text-xs tracking-widest uppercase font-bold">View All</Link>
             </div>
             <div className="space-y-3">
               {recentBattles.slice(0, 4).map((b: any, i: number) => {
                  let isWin = false;
                  const uId = user?._id || user?.id;
                  if (b.winner === uId) isWin = true;
                  else if (b.winner && b.winner._id === uId) isWin = true;
                  else if (b.teams) {
                    const myTeam = b.teams.find((t: any) => t.members.includes(uId) || t.members.some((m: any) => m._id === uId));
                    if (myTeam && b.result?.winningTeamId === myTeam.teamId) isWin = true;
                  }
                  
                  let displayStatus = b.status;
                  if (b.status === 'COMPLETED') {
                     displayStatus = isWin ? 'Win' : 'Loss';
                  } else if (b.status === 'Win' || b.status === 'Loss') {
                     displayStatus = b.status;
                     isWin = b.status === 'Win';
                  }

                  let diffColor = 'text-on-surface-variant';
                  if (b.difficulty === 'Easy') diffColor = 'text-emerald-400';
                  else if (b.difficulty === 'Medium') diffColor = 'text-primary';
                  else if (b.difficulty === 'Hard') diffColor = 'text-error';

                  return (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-variant">
                      <div className="flex items-center gap-4">
                         <span className={`inline-block px-2 py-1 rounded text-xs font-code-sm font-bold border ${
                            isWin ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                            displayStatus === 'Loss' ? 'bg-error/10 border-error/30 text-error' :
                            'bg-surface-variant/50 border-surface-variant text-on-surface-variant'
                          }`}>
                            {displayStatus}
                          </span>
                          <span className="font-code-sm text-sm text-on-surface truncate max-w-[150px] sm:max-w-xs">
                            {b.problem?.title || (typeof b.problem === 'string' ? b.problem : '') || b.battleCode}
                          </span>
                      </div>
                      <span className={`font-code-sm text-xs ${diffColor} font-bold tracking-widest uppercase`}>
                        {b.difficulty || 'Mixed'}
                      </span>
                    </div>
                  );
               })}
               {recentBattles.length === 0 && !loading && (
                 <div className="text-center py-6 text-on-surface-variant font-code-sm text-sm">No recent engagements found. Join the Arena to start tracking!</div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
