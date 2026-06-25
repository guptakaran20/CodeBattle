"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const getRank = (elo: number) => {
    if (elo < 1200) return 'Novice';
    if (elo < 1500) return 'Apprentice';
    if (elo < 1800) return 'Pro';
    if (elo < 2100) return 'Master';
    return 'Grandmaster';
  };

  const rank = user?.rating ? getRank(user.rating) : 'Guest';
  const username = user?.username || 'Guest Player';

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItemClass = (path: string) => `
    flex items-center gap-md px-md py-sm rounded transition-colors duration-150 font-label-caps text-label-caps uppercase tracking-widest
    ${isActive(path) 
      ? 'bg-surface-container-high text-primary dark:text-primary' 
      : 'text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-high'}
  `;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col justify-between fixed left-0 top-16 h-[calc(100vh-64px)] w-[280px] bg-surface-container-low dark:bg-surface-container-low border-r border-surface-variant dark:border-surface-variant py-md z-40">
      <div>
        <div className="px-lg pb-lg mb-sm border-b border-surface-variant">
          <div className="flex items-center gap-sm">
            <div className="w-10 h-10 rounded bg-surface-variant border border-surface-variant flex items-center justify-center font-bold text-primary uppercase">
              {username.charAt(0)}
            </div>
            <div>
              <div className="font-title-md text-title-md text-on-surface truncate w-40">{username}</div>
              <div className="font-body-sm text-body-sm text-on-surface-variant">Rank: {rank}</div>
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-xxs px-sm">
          <Link href="/dashboard" className={navItemClass('/dashboard')}>
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Overview
          </Link>
          <Link href="/history" className={navItemClass('/history')}>
            <span className="material-symbols-outlined text-[20px]">history</span>
            History
          </Link>
          <Link href="/leaderboard" className={navItemClass('/leaderboard')}>
            <span className="material-symbols-outlined text-[20px]">leaderboard</span>
            Leaderboard
          </Link>
          <Link href="/performance" className={navItemClass('/performance')}>
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            Performance
          </Link>
          <Link href="/tournaments" className={navItemClass('/tournaments')}>
            <span className="material-symbols-outlined text-[20px]">emoji_events</span>
            Tournaments
          </Link>
          <Link href="/profile" className={navItemClass('/profile')}>
            <span className="material-symbols-outlined text-[20px]">shield</span>
            Profile
          </Link>
        </nav>
      </div>

      <div className="px-sm">
        {isAuthenticated ? (
          <Link href="/arena" className="w-full flex justify-center items-center mb-md py-sm bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-opacity">
            Quick Battle
          </Link>
        ) : (
          <Link href="/login" className="w-full flex justify-center items-center mb-md py-sm bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase tracking-widest hover:opacity-90 transition-opacity">
            Log In to Battle
          </Link>
        )}
        
        <nav className="flex flex-col gap-xxs border-t border-surface-variant pt-sm">

          {isAuthenticated && (
            <button 
              onClick={async () => {
                await logout();
                window.location.href = '/login';
              }} 
              className="flex w-full items-center gap-md px-md py-sm rounded text-on-surface-variant dark:text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-colors duration-150 font-label-caps text-label-caps uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              Sign Out
            </button>
          )}
        </nav>
      </div>
    </aside>
  );
};
