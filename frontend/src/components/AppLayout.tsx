"use client";

import React from 'react';
import { useUI } from '@/context/UIContext';
import { TopNav as DashboardNavbar } from './TopNav';
import { LandingNavbar } from './LandingNavbar';
import { Sidebar } from './Sidebar';

import { usePathname } from 'next/navigation';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarVisible } = useUI();
  const pathname = usePathname();

  const sidebarRoutes = ['/dashboard', '/arena', '/history', '/leaderboard', '/profile'];
  const showSidebar = isSidebarVisible && sidebarRoutes.some(route => pathname?.startsWith(route));
  const showNavbar = pathname !== '/login' && pathname !== '/register' && pathname !== '/forgot-password' && !pathname?.startsWith('/battle');
  
  const isLandingPage = pathname === '/';

  return (
    <>
      {showNavbar && (isLandingPage ? <LandingNavbar /> : <DashboardNavbar />)}
      {showSidebar && <Sidebar />}
      <main className={`flex-1 overflow-y-auto bg-background transition-all duration-200 ${showSidebar ? 'md:ml-[280px]' : ''}`}>
        <div className={`${showNavbar ? 'mt-16 h-[calc(100vh-64px)]' : 'h-screen'} overflow-y-auto`}>
          {children}
        </div>
      </main>
    </>
  );
};
