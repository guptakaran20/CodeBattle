"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function Home() {
  const [stats, setStats] = useState({
    playersOnline: '1,204',
    battlesToday: '8,492',
    problemsSolved: '2.4M',
    topRating: '3420'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch platform stats', err);
      }
    };
    fetchStats();
    
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{`
        .glass-panel {
            background: rgba(49, 53, 60, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <main className="flex-grow pt-8 pb-xl px-margin-page max-w-7xl mx-auto w-full flex flex-col gap-[80px]">
        {/* 1. Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-[80px] gap-xl relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255, 193, 116, 0.05) 0%, transparent 60%)' }}></div>
          <h1 className="font-headline-xl text-headline-xl md:text-[64px] md:leading-[72px] font-bold text-on-surface tracking-tighter max-w-4xl z-10">
            Battle. Solve. Climb.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl z-10">
            The ultimate competitive programming arena. Test your algorithmic skills in real-time, 1v1 matchups.
          </p>
          <div className="flex gap-md z-10">
            <Link href="/arena" className="bg-primary hover:bg-primary-fixed text-on-primary font-label-caps text-label-caps px-xl py-sm rounded transition-colors duration-150 h-9 flex items-center justify-center">
              Start Battling
            </Link>
            <Link href="/leaderboard" className="bg-transparent border border-surface-variant hover:bg-surface-container text-on-surface font-label-caps text-label-caps px-xl py-sm rounded transition-colors duration-150 h-9 flex items-center justify-center">
              View Leaderboard
            </Link>
          </div>
        </section>

        {/* 2. Platform Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="glass-panel p-lg rounded flex flex-col gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Players Online</span>
            <span className="font-headline-lg text-headline-lg font-code-md text-primary tracking-tight">{stats.playersOnline}</span>
          </div>
          <div className="glass-panel p-lg rounded flex flex-col gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Battles Today</span>
            <span className="font-headline-lg text-headline-lg font-code-md text-primary tracking-tight">{stats.battlesToday}</span>
          </div>
          <div className="glass-panel p-lg rounded flex flex-col gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Problems Solved</span>
            <span className="font-headline-lg text-headline-lg font-code-md text-primary tracking-tight">{stats.problemsSolved}</span>
          </div>
          <div className="glass-panel p-lg rounded flex flex-col gap-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Top Rating</span>
            <span className="font-headline-lg text-headline-lg font-code-md text-primary tracking-tight">{stats.topRating}</span>
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="flex flex-col gap-xl">
          <div className="text-center">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            <div className="bg-surface-container-low border border-surface-variant p-lg rounded flex flex-col items-center text-center gap-md relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-5 rounded-full blur-xl"></div>
              <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>sports_esports</span>
              <h3 className="font-title-md text-title-md text-on-surface">1. Join Match</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Queue up and get matched instantly with an opponent of similar Elo rating.</p>
            </div>
            <div className="bg-surface-container-low border border-surface-variant p-lg rounded flex flex-col items-center text-center gap-md relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-5 rounded-full blur-xl"></div>
              <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>code_blocks</span>
              <h3 className="font-title-md text-title-md text-on-surface">2. Solve Problem</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Race against the clock to write efficient code. First to pass all test cases wins.</p>
            </div>
            <div className="bg-surface-container-low border border-surface-variant p-lg rounded flex flex-col items-center text-center gap-md relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-5 rounded-full blur-xl"></div>
              <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 0" }}>trending_up</span>
              <h3 className="font-title-md text-title-md text-on-surface">3. Win Rating</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Earn Elo rating points, climb the global leaderboard, and prove your dominance.</p>
            </div>
          </div>
        </section>

        {/* 4. Features Bento Grid */}
        <section className="flex flex-col gap-xl">
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-surface-container-high border border-surface-variant rounded p-xl flex flex-col justify-between group">
              <div className="flex flex-col gap-sm max-w-[28rem]">
                <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                <h3 className="font-title-md text-title-md text-on-surface">Real-Time Battles</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Experience zero-latency updates. See your opponent's submission status in real-time to keep the pressure on.</p>
              </div>
              <div className="mt-lg w-full h-32 bg-surface-dim border border-surface-variant rounded flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-300">
                <span className="font-code-md text-code-md text-primary">&gt; socket.connected()</span>
              </div>
            </div>
            <div className="col-span-1 bg-surface-container-high border border-surface-variant rounded p-xl flex flex-col justify-between">
              <div className="flex flex-col gap-sm">
                <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                <h3 className="font-title-md text-title-md text-on-surface">Elo Ranking</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">True skill matchmaking based on rigorous mathematical models.</p>
              </div>
            </div>
            <div className="col-span-1 bg-surface-container-high border border-surface-variant rounded p-xl flex flex-col justify-between">
              <div className="flex flex-col gap-sm">
                <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
                <h3 className="font-title-md text-title-md text-on-surface">Judge0 Execution</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Secure, sandboxed execution supporting 40+ languages.</p>
              </div>
            </div>
            <div className="col-span-1 md:col-span-2 bg-surface-container-high border border-surface-variant rounded p-xl flex flex-col justify-between">
              <div className="flex flex-col gap-sm">
                <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                <h3 className="font-title-md text-title-md text-on-surface">AI Code Review</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Post-match analysis provides instant feedback on time/space complexity and suggestions for optimization.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Leaderboard Preview */}
        <section className="flex flex-col gap-md">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Top Gladiators</h2>
            <Link href="/leaderboard" className="font-label-caps text-label-caps text-primary hover:text-primary-fixed transition-colors flex items-center gap-xs">
              Full Leaderboard <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
          <div className="bg-surface-container-low border border-surface-variant rounded overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-highest">
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant w-16 text-center">Rank</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant">Player</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant text-right">Rating</th>
                  <th className="py-sm px-md font-label-caps text-label-caps text-on-surface-variant text-right hidden sm:table-cell">Win Rate</th>
                </tr>
              </thead>
              <tbody className="font-code-sm text-code-sm">
                <tr className="border-b border-surface-variant hover:bg-surface-container-high transition-colors">
                  <td className="py-sm px-md text-primary font-bold text-center">#1</td>
                  <td className="py-sm px-md text-on-surface font-body-sm text-body-sm flex items-center gap-sm">
                    <div className="w-6 h-6 bg-surface-variant rounded-full border border-primary"></div>
                    void_pointer
                  </td>
                  <td className="py-sm px-md text-on-surface text-right">3420</td>
                  <td className="py-sm px-md text-on-surface-variant text-right hidden sm:table-cell">89%</td>
                </tr>
                <tr className="border-b border-surface-variant hover:bg-surface-container-high transition-colors">
                  <td className="py-sm px-md text-on-surface-variant text-center">#2</td>
                  <td className="py-sm px-md text-on-surface font-body-sm text-body-sm flex items-center gap-sm">
                    <div className="w-6 h-6 bg-surface-variant rounded-full"></div>
                    bit_shifter
                  </td>
                  <td className="py-sm px-md text-on-surface text-right">3395</td>
                  <td className="py-sm px-md text-on-surface-variant text-right hidden sm:table-cell">86%</td>
                </tr>
                <tr className="border-b border-surface-variant hover:bg-surface-container-high transition-colors">
                  <td className="py-sm px-md text-on-surface-variant text-center">#3</td>
                  <td className="py-sm px-md text-on-surface font-body-sm text-body-sm flex items-center gap-sm">
                    <div className="w-6 h-6 bg-surface-variant rounded-full"></div>
                    algo_rythm
                  </td>
                  <td className="py-sm px-md text-on-surface text-right">3310</td>
                  <td className="py-sm px-md text-on-surface-variant text-right hidden sm:table-cell">84%</td>
                </tr>
                <tr className="border-b border-surface-variant hover:bg-surface-container-high transition-colors">
                  <td className="py-sm px-md text-on-surface-variant text-center">#4</td>
                  <td className="py-sm px-md text-on-surface font-body-sm text-body-sm flex items-center gap-sm">
                    <div className="w-6 h-6 bg-surface-variant rounded-full"></div>
                    null_sec
                  </td>
                  <td className="py-sm px-md text-on-surface text-right">3280</td>
                  <td className="py-sm px-md text-on-surface-variant text-right hidden sm:table-cell">82%</td>
                </tr>
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="py-sm px-md text-on-surface-variant text-center">#5</td>
                  <td className="py-sm px-md text-on-surface font-body-sm text-body-sm flex items-center gap-sm">
                    <div className="w-6 h-6 bg-surface-variant rounded-full"></div>
                    root_user
                  </td>
                  <td className="py-sm px-md text-on-surface text-right">3245</td>
                  <td className="py-sm px-md text-on-surface-variant text-right hidden sm:table-cell">81%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. CTA Banner */}
        <section className="bg-surface-container-highest border border-surface-variant rounded p-xl flex flex-col md:flex-row items-center justify-between gap-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-primary/10 to-transparent pointer-events-none"></div>
          <div className="flex flex-col gap-sm z-10">
            <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Ready to prove your skills?</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Join thousands of developers competing globally.</p>
          </div>
          <Link href="/register" className="bg-primary hover:bg-primary-fixed text-on-primary font-label-caps text-label-caps px-xl py-sm rounded transition-colors duration-150 h-9 flex items-center justify-center whitespace-nowrap z-10 shrink-0 shadow-[0_0_15px_rgba(255,193,116,0.3)]">
            Create Account
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl px-margin-page flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-surface-variant dark:border-surface-variant flat no shadows mt-auto">
        <div className="font-label-caps text-label-caps text-on-surface-variant">
          © 2026 CodeArena Infrastructure. All systems operational.
        </div>
        <div className="flex gap-lg">
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-150" href="/terms">Terms</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-150" href="/privacy">Privacy</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-150" href="/api-docs">API Docs</Link>
          <Link className="font-label-caps text-label-caps text-on-surface-variant dark:text-on-surface-variant hover:text-primary dark:hover:text-primary transition-colors duration-150" href="/status">Status</Link>
        </div>
      </footer>
    </>
  );
}
