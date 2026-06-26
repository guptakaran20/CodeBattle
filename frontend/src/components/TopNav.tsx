"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const TopNav = () => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const { isSidebarVisible, setSidebarVisible } = useUI();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  
  const sidebarRoutes = ['/dashboard', '/arena', '/history', '/leaderboard', '/performance', '/tournaments', '/profile'];
  const hasSidebar = sidebarRoutes.some(route => pathname?.startsWith(route));

  const navItemClass = (path: string) => `
    font-label-caps text-xs hover:text-primary transition-colors duration-150 uppercase tracking-widest font-semibold cursor-pointer
    ${isActive(path) 
      ? 'text-primary' 
      : 'text-on-surface-variant'}
  `;

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-page h-16 bg-background/80 backdrop-blur-md border-b border-surface-variant">
      <div className="flex items-center gap-4">
        {(isAuthenticated && hasSidebar) && (
          <button 
            onClick={() => setSidebarVisible(!isSidebarVisible)} 
            className="text-on-surface hover:text-primary transition-colors flex items-center justify-center p-1 rounded-md hover:bg-surface-variant/50"
          >
            <span className="material-symbols-outlined">{isSidebarVisible ? 'menu_open' : 'menu'}</span>
          </button>
        )}
        <Link href="/" className="font-headline-lg text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>code_blocks</span>
          CodeArena
        </Link>
        <div className="hidden md:flex gap-8 ml-12">
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
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-on-surface-variant hover:text-primary transition-colors relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-variant/50"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-error text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px] h-[18px]">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-[85vh] bg-surface-container-high border border-surface-variant rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-surface-container">
                    <h3 className="font-headline-lg font-bold text-on-surface">Notifications</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-xs font-label-caps uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">notifications_paused</span>
                        <p className="text-sm font-code-sm">No notifications yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-surface-variant">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 hover:bg-surface-container transition-colors relative group cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-primary/5 border-l-2 border-primary'}`}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif.id);
                              setIsDropdownOpen(false);
                              if (notif.data?.battleCode) router.push(`/battle/${notif.data.battleCode}`);
                              else if (notif.data?.replayId) router.push(`/replay/${notif.data.replayId}`);
                              else if (notif.data?.challengeId) router.push(`/challenge/${notif.data.challengeId}`);
                              else if (notif.data?.tournamentId) router.push(`/tournaments/${notif.data.tournamentId}`);
                            }}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex-1 pr-6">
                                <h4 className={`text-sm font-semibold mb-1 ${notif.isRead ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                                  {notif.title}
                                </h4>
                                <p className="text-xs text-on-surface-variant font-code-sm line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-on-surface-variant mt-2 block opacity-70">
                                  {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                              className="absolute top-4 right-4 text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                              title="Delete notification"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
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
