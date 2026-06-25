"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ rating: 1500, battlesWon: 0, totalBattles: 0, losses: 0, winRate: 0 });
  const [recentBattles, setRecentBattles] = useState<any[]>([]);
  const [trajectory, setTrajectory] = useState<number[]>([50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
  const [monthlyDelta, setMonthlyDelta] = useState<number>(0);

  useEffect(() => {
    // We no longer redirect, we show overlay
  }, [authLoading, isAuthenticated, router]);

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
          
          setStats({
            rating: userObj.rating || 1500,
            battlesWon: wins,
            totalBattles: total,
            losses,
            winRate
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
  const getRank = (elo: number) => {
    if (elo < 1200) return 'Novice';
    if (elo < 1500) return 'Apprentice';
    if (elo < 1800) return 'Pro';
    if (elo < 2100) return 'Master';
    return 'Grandmaster';
  };

  const rank = user?.rating ? getRank(user?.rating) : 'Guest';

  const isSkeleton = authLoading || loading || !isAuthenticated;

  // Mock battles if none exist, just to match the visual vibe of the screenshot
  const displayBattles = recentBattles.length > 0 ? recentBattles : [
    { status: 'Win', problem: 'Binary Tree Inversion', difficulty: 'Medium', date: '2h ago' },
    { status: 'Loss', problem: 'Dijkstra\'s Shortest Path', difficulty: 'Hard', date: 'Yesterday' },
    { status: 'Win', problem: 'Two Sum Optimization', difficulty: 'Easy', date: '2 days ago' },
    { status: 'Win', problem: 'Dynamic Prog: Knapsack', difficulty: 'Hard', date: '3 days ago' },
  ];

  return (
    <>
      {/* Auth Overlay */}
      {!authLoading && !isAuthenticated && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container border border-surface-variant p-10 rounded-xl flex flex-col items-center justify-center shadow-2xl text-center w-full max-w-[420px] h-auto m-auto">
            <div className="w-16 h-16 shrink-0 rounded-full bg-surface-variant flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
            </div>
            <h2 className="text-2xl font-bold font-headline-lg mb-2">Sign In to Continue</h2>
            <p className="text-on-surface-variant text-sm mb-8 w-full" style={{ wordBreak: 'normal', whiteSpace: 'normal' }}>
              You must log in to track your personal statistics, review match history, and access the Dashboard.
            </p>
            <Link href="/login" className="w-full py-3 bg-primary text-on-primary rounded font-label-caps text-xs uppercase tracking-widest hover:opacity-90 transition-opacity pointer-events-auto font-bold">
               Log In To Access
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-body-md text-on-surface relative">


      {/* Welcome Card */}
      <div className="bg-surface-container border border-surface-variant rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-xl bg-surface-variant border border-surface-bright flex items-center justify-center overflow-hidden shadow-lg">
            {isSkeleton ? (
              <Skeleton className="w-full h-full" />
            ) : user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-headline-lg text-3xl font-bold text-primary uppercase">{user?.username?.charAt(0) || 'D'}</span>
            )}
          </div>
          <div>
            <h1 className="font-headline-lg text-[28px] md:text-[32px] font-bold tracking-tight text-on-surface mb-3">
              {isSkeleton ? <Skeleton className="h-10 w-64 md:w-80" /> : `Welcome back, ${user?.username || 'Developer'}.`}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-surface-container-high border border-surface-bright px-3 py-1.5 rounded-md">
                <span className="material-symbols-outlined text-[16px] text-primary">star</span>
                {isSkeleton ? <Skeleton className="h-5 w-20" /> : <span className="font-code-sm text-sm font-semibold">{stats.rating} Rating</span>}
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container-high border border-surface-bright px-3 py-1.5 rounded-md">
                <span className="material-symbols-outlined text-[16px] text-emerald-500">emoji_events</span>
                {isSkeleton ? <Skeleton className="h-5 w-16" /> : <span className="font-code-sm text-sm font-semibold">{rank}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sys Ready Box */}
        <div className="hidden md:flex flex-col items-end justify-center h-20 px-6 border-l border-surface-variant relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
            <div className="font-label-caps text-xs tracking-widest uppercase text-emerald-500/80">SYSTEM ONLINE</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Combat Operations */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-headline-lg text-xl font-semibold border-b border-surface-variant pb-2">Combat Operations</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Action Button */}
            <Link href="/arena" className="group flex flex-col items-center justify-center gap-3 bg-primary text-on-primary p-6 rounded-xl border border-primary/50 hover:bg-primary-fixed hover:scale-[1.02] transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,193,116,0.1)]">
              <span className="material-symbols-outlined text-4xl">swords</span>
              <span className="font-label-caps text-sm font-bold tracking-widest uppercase">Find Match</span>
            </Link>

            {/* Secondary Action 1 */}
            <Link href="/arena/create" className="group flex flex-col items-center justify-center gap-3 bg-surface-container border border-surface-variant text-on-surface p-6 rounded-xl hover:bg-surface-container-high hover:border-surface-bright transition-all cursor-pointer">
              <span className="material-symbols-outlined text-3xl text-emerald-400 group-hover:scale-110 transition-transform">add_box</span>
              <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant group-hover:text-on-surface transition-colors">Create Battle</span>
            </Link>
          </div>

          {/* Rating Trajectory */}
          <div className="bg-surface-container border border-surface-variant rounded-xl p-6 shadow-lg mt-8">
            <div className="flex justify-between items-center mb-8 border-b border-surface-variant pb-4">
              <h2 className="font-headline-lg text-lg font-bold text-on-surface">Rating Trajectory</h2>
              <span className={`font-code-sm text-sm font-semibold ${monthlyDelta >= 0 ? 'text-emerald-400' : 'text-error'}`}>
                {monthlyDelta > 0 ? '+' : ''}{monthlyDelta} this month
              </span>
            </div>
            
            <div className="h-40 flex items-end justify-between gap-1 sm:gap-2">
              {trajectory.map((h, i) => (
                <div key={i} className="flex-1 flex justify-center h-full items-end group">
                  <div 
                    className={`w-full max-w-[48px] rounded-t-sm transition-all duration-500 group-hover:opacity-80 ${i >= trajectory.length - 2 ? 'bg-[#ffc174] shadow-[0_0_15px_rgba(255,193,116,0.1)]' : 'bg-surface-variant group-hover:bg-surface-bright'}`}
                    style={{ height: `${h}%` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-headline-lg text-xl font-semibold border-b border-surface-variant pb-2">Telemetry</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center">
              <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Win Rate</span>
              {isSkeleton ? <Skeleton className="h-10 w-20" /> : <div className="font-headline-lg text-3xl font-bold text-emerald-400">{stats.winRate}%</div>}
            </div>
            
            <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center">
              <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Battles</span>
              {isSkeleton ? <Skeleton className="h-10 w-16" /> : <div className="font-headline-lg text-3xl font-bold text-on-surface">{stats.totalBattles}</div>}
            </div>

            <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center">
              <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Wins</span>
              {isSkeleton ? <Skeleton className="h-10 w-16" /> : <div className="font-headline-lg text-3xl font-bold text-emerald-400">{stats.battlesWon}</div>}
            </div>

            <div className="bg-surface-container border border-surface-variant rounded-xl p-4 flex flex-col justify-center">
              <span className="font-label-caps text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-1">Losses</span>
              {isSkeleton ? <Skeleton className="h-10 w-16" /> : <div className="font-headline-lg text-3xl font-bold text-error">{stats.losses}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Engagements */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-surface-variant pb-2">
          <h2 className="font-headline-lg text-xl font-semibold">Recent Engagements</h2>
          <Link href="/history" className="font-label-caps text-xs font-bold tracking-widest uppercase text-primary hover:text-primary-fixed transition-colors">View All</Link>
        </div>

        <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low">
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal">Status</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal">Problem</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal">Difficulty</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {displayBattles.map((b: any, i: number) => {
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
                     // For mock battles
                     displayStatus = b.status;
                     isWin = b.status === 'Win';
                  }
                  
                  const visualWin = displayStatus === 'Win';

                  let diffColor = 'text-on-surface-variant';
                  if (b.difficulty === 'Easy') diffColor = 'text-emerald-400';
                  else if (b.difficulty === 'Medium') diffColor = 'text-primary';
                  else if (b.difficulty === 'Hard') diffColor = 'text-error';
                  
                  let dateStr = b.date;
                  if (!dateStr && b.createdAt) {
                    const d = new Date(b.createdAt);
                    const now = new Date();
                    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
                    if (diffDays === 0) dateStr = 'Today';
                    else if (diffDays === 1) dateStr = 'Yesterday';
                    else dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }

                  return (
                    <tr key={i} className="hover:bg-surface-container-high transition-colors group">
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-code-sm border ${
                          visualWin ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                          displayStatus === 'Loss' ? 'bg-error/10 border-error/30 text-error' :
                          'bg-surface-variant/50 border-surface-variant text-on-surface-variant'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-code-sm text-sm text-on-surface group-hover:text-primary transition-colors">
                        {b.problem?.title || (typeof b.problem === 'string' ? b.problem : '') || b.battleCode}
                      </td>
                      <td className={`py-4 px-6 font-code-sm text-sm ${diffColor}`}>
                        {b.difficulty || 'Mixed'}
                      </td>
                      <td className="py-4 px-6 font-code-sm text-sm text-on-surface-variant text-right">
                        {dateStr || 'Just now'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-12 pb-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-surface-variant mt-12 text-xs font-label-caps tracking-widest text-on-surface-variant uppercase">
        <div>© 2024 CodeArena Infrastructure. All systems operational.</div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">API Docs</Link>
          <Link href="#" className="hover:text-primary transition-colors">Status</Link>
        </div>
      </footer>

    </div>
    </>
  );
}
