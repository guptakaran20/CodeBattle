import React from 'react';
import Link from 'next/link';

export const CTA = () => {
  return (
    <section className="w-full py-0">
      <div className="relative w-full rounded-[2rem] overflow-hidden bg-[#0a0a0c] border border-surface-variant flex flex-col items-center justify-center text-center px-6 py-24 md:py-32 group shadow-2xl">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-[100%] pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000"></div>
        
        {/* Abstract Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="20%" x2="100%" y2="80%" stroke="url(#primary-grad)" strokeWidth="1" />
            <line x1="0" y1="80%" x2="100%" y2="20%" stroke="url(#primary-grad)" strokeWidth="1" />
            <defs>
              <linearGradient id="primary-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="50%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-4">
            <h2 className="font-headline-lg text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Ready to claim your rank?
            </h2>
            <p className="font-body-md text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed">
              Join thousands of top developers battling it out in real-time. Prove your algorithmic dominance and climb the global leaderboard today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
            <Link href="/register" className="w-full sm:w-auto bg-primary hover:bg-primary-fixed text-on-primary font-label-caps text-base uppercase tracking-widest px-10 py-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-bold shadow-[0_0_30px_rgba(255,193,116,0.2)] hover:shadow-[0_0_40px_rgba(255,193,116,0.4)] hover:-translate-y-1">
              Start Battling Now <span className="material-symbols-outlined text-[20px]">swords</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
