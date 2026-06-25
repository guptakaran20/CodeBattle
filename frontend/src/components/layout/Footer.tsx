import React from 'react';
import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="w-full py-8 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-surface-variant bg-[#0e0e11] mt-12 relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">swords</span>
          <span className="font-label-caps text-sm text-on-surface font-bold uppercase tracking-widest">CodeArena</span>
        </div>
        <div className="hidden md:block w-1 h-1 rounded-full bg-surface-variant"></div>
        <div className="font-code-sm text-xs text-on-surface-variant">
          © 2026 CodeArena Infrastructure. All systems operational.
        </div>
      </div>
      
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        <Link className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors duration-150 uppercase tracking-widest font-bold" href="/terms">Terms</Link>
        <Link className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors duration-150 uppercase tracking-widest font-bold" href="/privacy">Privacy</Link>
        <Link className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors duration-150 uppercase tracking-widest font-bold" href="/api-docs">API Docs</Link>
        <Link className="font-label-caps text-xs text-on-surface-variant hover:text-primary transition-colors duration-150 uppercase tracking-widest font-bold flex items-center gap-1" href="/status">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Status
        </Link>
      </div>
    </footer>
  );
};
