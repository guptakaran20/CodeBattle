"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function AppearancePage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [editorLocation, setEditorLocation] = useState('right'); // left, right, split

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(storedTheme);
    document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    
    const storedEditor = localStorage.getItem('editorLocation') || 'right';
    setEditorLocation(storedEditor);
  }, []);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast.success(`Theme switched to ${newTheme} mode.`);
  };

  const handleEditorChange = (newLoc: string) => {
    setEditorLocation(newLoc);
    localStorage.setItem('editorLocation', newLoc);
    toast.success(`Editor location updated.`);
  };

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-body-md text-on-surface">
      
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-[28px] md:text-[32px] font-bold tracking-tight text-on-surface mb-2">
          Appearance
        </h1>
        <p className="font-code-sm text-sm text-on-surface-variant">
          Customize the visual theme and workspace layout of the arena.
        </p>
      </div>

      <div className="space-y-6 max-w-4xl">
        
        {/* Theme Settings */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="font-headline-lg text-xl font-semibold mb-2">Arena Theme</h2>
            <p className="font-code-sm text-sm text-on-surface-variant mb-6">Select the primary terminal color scheme.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme */}
              <button 
                onClick={() => handleThemeChange('light')}
                className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${theme === 'light' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,193,116,0.15)] text-primary' : 'bg-surface-container-low border-surface-variant text-on-surface-variant hover:border-surface-bright hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">light_mode</span>
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase">Light Protocol</span>
              </button>

              {/* Dark Theme */}
              <button 
                onClick={() => handleThemeChange('dark')}
                className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${theme === 'dark' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,193,116,0.15)] text-primary' : 'bg-surface-container-low border-surface-variant text-on-surface-variant hover:border-surface-bright hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">dark_mode</span>
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase">Dark Protocol</span>
              </button>

              {/* System Theme */}
              <button 
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-surface-variant bg-surface-container-low text-on-surface-variant opacity-50 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[32px]">desktop_windows</span>
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase">System Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor Layout Settings */}
        <div className="bg-surface-container border border-surface-variant rounded-xl p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="font-headline-lg text-xl font-semibold mb-2">Editor Workspace</h2>
            <p className="font-code-sm text-sm text-on-surface-variant mb-6">Configure the layout of your coding terminal during combat.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => handleEditorChange('left')}
                className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${editorLocation === 'left' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,193,116,0.15)] text-primary' : 'bg-surface-container-low border-surface-variant text-on-surface-variant hover:border-surface-bright hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">dock_to_left</span>
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase">Left Panel</span>
              </button>

              <button 
                onClick={() => handleEditorChange('right')}
                className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${editorLocation === 'right' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,193,116,0.15)] text-primary' : 'bg-surface-container-low border-surface-variant text-on-surface-variant hover:border-surface-bright hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">dock_to_right</span>
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase">Right Panel</span>
              </button>

              <button 
                onClick={() => handleEditorChange('bottom')}
                className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${editorLocation === 'bottom' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(255,193,116,0.15)] text-primary' : 'bg-surface-container-low border-surface-variant text-on-surface-variant hover:border-surface-bright hover:text-on-surface'}`}
              >
                <span className="material-symbols-outlined text-[32px] group-hover:scale-110 transition-transform">dock_to_bottom</span>
                <span className="font-label-caps text-xs font-semibold tracking-widest uppercase">Bottom Panel</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
