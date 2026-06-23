"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';

export const TopNav = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { isSidebarVisible, setSidebarVisible } = useUI();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  
  const sidebarRoutes = ['/dashboard', '/arena', '/history', '/leaderboard', '/profile', '/appearance'];
  const hasSidebar = sidebarRoutes.some(route => pathname?.startsWith(route));

  const navItemClass = (path: string) => `
    font-label-caps text-label-caps hover:text-primary transition-colors duration-150 uppercase tracking-widest
    ${isActive(path) 
      ? 'text-primary border-b-2 border-primary pb-1 scale-95 transition-transform' 
      : 'text-on-surface-variant'}
  `;

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-page h-16 bg-surface dark:bg-surface border-b border-surface-variant dark:border-surface-variant">
      <div className="flex items-center gap-4">
        {(isAuthenticated && hasSidebar) && (
          <button 
            onClick={() => setSidebarVisible(!isSidebarVisible)} 
            className="text-on-surface hover:text-primary transition-colors flex items-center justify-center p-1 rounded-md hover:bg-surface-variant/50"
          >
            <span className="material-symbols-outlined">{isSidebarVisible ? 'menu_open' : 'menu'}</span>
          </button>
        )}
        <Link href="/" className="font-headline-lg text-headline-lg font-bold text-primary dark:text-primary">
          CodeArena
        </Link>
        <div className="hidden md:flex gap-lg ml-xl">
          <Link href="/dashboard" className={navItemClass('/dashboard')}>
            Dashboard
          </Link>
          <Link href="/arena" className={navItemClass('/arena')}>
            Arena
          </Link>
          <Link href="/leaderboard" className={navItemClass('/leaderboard')}>
            Leaderboard
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-md">
        {isAuthenticated ? (
          <>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <Link href="/appearance" className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">palette</span>
            </Link>
            <Link href="/profile" className="w-8 h-8 rounded bg-surface-variant border border-surface-variant flex items-center justify-center font-bold text-primary hover:opacity-80">
              {user?.username?.charAt(0).toUpperCase()}
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-on-surface-variant hover:text-primary font-label-caps uppercase tracking-widest text-xs font-semibold transition-colors">
              Log in
            </Link>
            <Link href="/register" className="bg-primary text-on-primary px-4 py-1.5 rounded font-label-caps uppercase tracking-widest text-xs font-semibold hover:opacity-90 transition-opacity">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
