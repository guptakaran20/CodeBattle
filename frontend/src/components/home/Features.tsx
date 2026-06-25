import React from 'react';

export const Features = () => {
  return (
    <section id="features" className="flex flex-col gap-12">
      <div className="flex flex-col gap-4 max-w-2xl text-center mx-auto sm:text-left sm:mx-0">
        <h2 className="font-label-caps uppercase tracking-widest text-primary text-sm font-bold">Platform Features</h2>
        <h3 className="font-headline-lg text-3xl md:text-4xl font-bold text-on-surface">Why Developers Love CodeArena</h3>
        <p className="font-body-md text-on-surface-variant text-base">
          Built from the ground up for zero-latency competition, true skill matchmaking, and immediate feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Massive Featured Card */}
        <div className="md:col-span-2 lg:col-span-2 row-span-2 bg-gradient-to-br from-[#1c1d21] to-[#131418] border border-surface-variant rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:opacity-10 transition-opacity duration-500"></div>
          
          <div className="flex flex-col gap-4 z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
              <span className="material-symbols-outlined text-[24px]">bolt</span>
            </div>
            <h4 className="font-headline-md text-2xl font-bold text-on-surface">Sub-millisecond Real-Time Battles</h4>
            <p className="font-body-md text-on-surface-variant text-base leading-relaxed">
              Experience the pressure of true head-to-head competition. See your opponent's cursor movements, syntax errors, and test case submissions in real-time. Zero latency. Zero excuses.
            </p>
          </div>

          <div className="mt-12 w-full h-40 bg-[#0e0e11] border border-surface-variant rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:border-primary/30 transition-colors">
            {/* Abstract visual of realtime connection */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            <div className="flex items-center gap-4 z-10">
              <div className="px-4 py-2 bg-surface-variant/30 border border-surface-variant rounded-lg font-code-sm text-on-surface text-sm">socket.connected</div>
              <span className="animate-pulse text-primary material-symbols-outlined">sync_alt</span>
              <div className="px-4 py-2 bg-surface-variant/30 border border-surface-variant rounded-lg font-code-sm text-on-surface text-sm">latency: 12ms</div>
            </div>
          </div>
        </div>

        {/* Smaller Card 1 */}
        <div className="md:col-span-1 lg:col-span-2 bg-[#131418] border border-surface-variant rounded-3xl p-8 flex flex-col gap-4 hover:border-surface-variant-hover transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface-variant/50 border border-surface-variant flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[20px]">military_tech</span>
          </div>
          <h4 className="font-title-lg text-xl font-bold text-on-surface">True Elo Matchmaking</h4>
          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            Stop grinding against random problems. Our matchmaking algorithm pairs you with opponents of similar skill levels based on rigorously tested mathematical models.
          </p>
        </div>

        {/* Smaller Card 2 */}
        <div className="md:col-span-1 lg:col-span-1 bg-[#131418] border border-surface-variant rounded-3xl p-8 flex flex-col gap-4 hover:border-surface-variant-hover transition-colors">
          <div className="w-10 h-10 rounded-xl bg-surface-variant/50 border border-surface-variant flex items-center justify-center text-on-surface">
            <span className="material-symbols-outlined text-[20px]">terminal</span>
          </div>
          <h4 className="font-title-lg text-lg font-bold text-on-surface">Judge0 Execution</h4>
          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            Secure, sandboxed code execution supporting over 40+ languages.
          </p>
        </div>

        {/* Smaller Card 3 */}
        <div className="md:col-span-1 lg:col-span-1 bg-[#131418] border border-surface-variant rounded-3xl p-8 flex flex-col gap-4 hover:border-emerald-500/30 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <h4 className="font-title-lg text-lg font-bold text-on-surface">AI Code Review</h4>
          <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
            Get instant feedback on time/space complexity and optimization hints post-match.
          </p>
        </div>

      </div>
    </section>
  );
};
