"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItemClass = "font-label-caps text-xs hover:text-primary transition-colors duration-150 uppercase tracking-widest text-on-surface-variant font-semibold cursor-pointer";

  return (
    <nav className={`fixed top-0 w-full z-50 flex justify-between items-center px-margin-page h-16 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-surface-variant' : 'bg-transparent'}`}>
      <div className="flex items-center gap-4">
        <Link href="/" className="font-headline-lg text-xl font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>code_blocks</span>
          CodeArena
        </Link>
        <div className="hidden md:flex gap-8 ml-12">
          <a onClick={(e) => scrollToSection(e, 'features')} className={navItemClass}>
            Features
          </a>
          <a onClick={(e) => scrollToSection(e, 'leaderboard')} className={navItemClass}>
            Leaderboard
          </a>
          <a onClick={(e) => scrollToSection(e, 'how-it-works')} className={navItemClass}>
            About
          </a>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-on-surface hover:text-primary font-label-caps uppercase tracking-widest text-xs font-semibold transition-colors">
          Log in
        </Link>
        <Link href="/register" className="bg-primary text-on-primary px-5 py-2 rounded-xl font-label-caps uppercase tracking-widest text-xs font-bold hover:bg-primary-fixed hover:scale-105 transition-all shadow-[0_4px_14px_rgba(255,193,116,0.15)]">
          Get Started
        </Link>
      </div>
    </nav>
  );
};
