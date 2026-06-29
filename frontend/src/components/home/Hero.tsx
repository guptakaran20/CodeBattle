"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BattlePreview } from './BattlePreview';
import { useAuth } from '@/context/AuthContext';

const activityFeed = [
  { icon: 'local_fire_department', text: 'DevAlpha defeated CodeMaster', color: 'text-orange-500' },
  { icon: 'bolt', text: 'Match Found', color: 'text-primary' },
  { icon: 'smart_toy', text: 'AI Review Ready', color: 'text-emerald-400' },
  { icon: 'workspace_premium', text: 'New Rank: Gold', color: 'text-amber-400' },
  { icon: 'target', text: 'Weekend Cup starts in 12 min', color: 'text-blue-400' }
];

export const Hero = () => {
  const { isAuthenticated } = useAuth();
  const [currentActivity, setCurrentActivity] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivity((prev) => (prev + 1) % activityFeed.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-20 pb-20 px-margin-page min-h-[80vh] flex items-center relative overflow-hidden">
      {/* Subtle Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
        
        {/* Left Column: Copy */}
        <div className="w-full lg:w-1/2 flex flex-col items-start text-left min-w-0 shrink-0">

          <h1 className="font-headline-lg text-5xl md:text-7xl font-bold tracking-tight text-on-surface mb-6 leading-[1.1]">
            Practice. <br/>
            Compete. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
              Improve.
            </span>
          </h1>
          
          <p className="text-on-surface-variant text-lg md:text-xl max-w-[500px] mb-10 leading-relaxed min-w-[300px]">
            The premier platform for competitive programmers. Battle real opponents in real-time, get instant AI code reviews, and climb the global ranks.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto">
            <Link href={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-label-caps uppercase tracking-widest text-sm font-bold hover:bg-primary-fixed hover:scale-105 transition-all shadow-[0_4px_20px_rgba(255,193,116,0.2)] text-center">
              Start Battling Now
            </Link>
            <Link href="/arena" className="w-full sm:w-auto bg-surface border border-surface-variant text-on-surface px-8 py-3.5 rounded-xl font-label-caps uppercase tracking-widest text-sm font-semibold hover:bg-surface-variant transition-colors text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              View Arena
            </Link>
          </div>

          {/* Subtle Activity Feed */}
          <div className="h-10 w-full max-w-sm flex items-center">
            <div 
              key={currentActivity}
              className="flex items-center gap-3 text-sm font-semibold text-gray-300 animate-fade-in"
            >
              <span className={`material-symbols-outlined text-[20px] ${activityFeed[currentActivity].color}`}>
                {activityFeed[currentActivity].icon}
              </span>
              <span>{activityFeed[currentActivity].text}</span>
            </div>
          </div>

        </div>

        {/* Right Column: Visual */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end min-w-0">
          <div className="relative w-full max-w-2xl transform lg:rotate-[2deg] hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-emerald-500/20 blur-[80px] -z-10 rounded-full"></div>
            <BattlePreview />
          </div>
        </div>

      </div>
    </section>
  );
};
