import React from 'react';

export const BattlePreview = () => {
  return (
    <div className="w-full max-w-2xl bg-[#0e0e11] border border-surface-variant rounded-xl overflow-hidden shadow-2xl flex flex-col pointer-events-none select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-variant bg-[#131418]">
        {/* Player 1 */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center font-bold text-xs">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-on-surface">DevAlpha</span>
            <span className="text-xs text-on-surface-variant flex items-center gap-1">
              1842 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-label-caps uppercase tracking-widest text-on-surface-variant mb-0.5">VS</span>
          <div className="bg-surface-variant/50 px-3 py-1 rounded flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            <span className="font-code-md text-sm">12:43</span>
          </div>
        </div>

        {/* Player 2 */}
        <div className="flex items-center gap-3 text-right">
          <div className="flex flex-col">
            <span className="font-semibold text-sm text-on-surface">CodeMaster</span>
            <span className="text-xs text-on-surface-variant flex items-center justify-end gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> 1798
            </span>
          </div>
          <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center font-bold text-xs text-primary">
            C
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-1 min-h-[240px] bg-[#0d0d10] relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0e0e11]/80 z-10 pointer-events-none"></div>
        
        {/* Left Code (P1) */}
        <div className="flex-1 p-4 border-r border-surface-variant overflow-hidden min-w-0">
          <div className="flex justify-between items-center mb-3 text-xs text-on-surface-variant">
            <span>&lt;/&gt;</span>
            <span className="bg-surface-variant/30 px-2 py-0.5 rounded text-[10px]">C++</span>
          </div>
          <pre className="font-code-sm text-xs leading-5 text-[#a1a1aa] opacity-80">
<span className="text-[#c678dd]">class</span> <span className="text-[#e5c07b]">Solution</span> {'{'}
<span className="text-[#c678dd]">public:</span>
    <span className="text-[#e5c07b]">vector</span>&lt;<span className="text-[#c678dd]">int</span>&gt; <span className="text-[#61afef]">twoSum</span>(<span className="text-[#e5c07b]">vector</span>&lt;<span className="text-[#c678dd]">int</span>&gt;&amp; <span className="text-[#e06c75]">nums</span>, <span className="text-[#c678dd]">int</span> <span className="text-[#e06c75]">target</span>) {'{'}
        <span className="text-[#e5c07b]">unordered_map</span>&lt;<span className="text-[#c678dd]">int</span>, <span className="text-[#c678dd]">int</span>&gt; <span className="text-[#e06c75]">m</span>;
        <span className="text-[#c678dd]">for</span>(<span className="text-[#c678dd]">int</span> <span className="text-[#e06c75]">i</span> = <span className="text-[#d19a66]">0</span>; <span className="text-[#e06c75]">i</span> &lt; <span className="text-[#e06c75]">nums</span>.<span className="text-[#61afef]">size</span>(); <span className="text-[#e06c75]">i</span>++) {'{'}
            <span className="text-[#c678dd]">int</span> <span className="text-[#e06c75]">diff</span> = <span className="text-[#e06c75]">target</span> - <span className="text-[#e06c75]">nums</span>[<span className="text-[#e06c75]">i</span>];
            <span className="text-[#c678dd]">if</span>(<span className="text-[#e06c75]">m</span>.<span className="text-[#61afef]">count</span>(<span className="text-[#e06c75]">diff</span>)) {'{'}
                <span className="text-[#c678dd]">return</span> {'{'} <span className="text-[#e06c75]">m</span>[<span className="text-[#e06c75]">diff</span>], <span className="text-[#e06c75]">i</span> {'}'};
            {'}'}
            <span className="text-[#e06c75]">m</span>[<span className="text-[#e06c75]">nums</span>[<span className="text-[#e06c75]">i</span>]] = <span className="text-[#e06c75]">i</span>;
        {'}'}
    {'}'}
{'}'};
          </pre>
        </div>

        {/* Right Code (P2) */}
        <div className="flex-1 p-4 overflow-hidden relative min-w-0">
          <div className="flex justify-between items-center mb-3 text-xs text-on-surface-variant">
            <span>&lt;/&gt;</span>
            <span className="bg-surface-variant/30 px-2 py-0.5 rounded text-[10px]">Python</span>
          </div>
          <pre className="font-code-sm text-xs leading-5 text-[#a1a1aa] opacity-60 filter blur-[0.5px]">
<span className="text-[#c678dd]">class</span> <span className="text-[#e5c07b]">Solution</span>:
    <span className="text-[#c678dd]">def</span> <span className="text-[#61afef]">twoSum</span>(<span className="text-[#e06c75]">self</span>, <span className="text-[#e06c75]">nums</span>, <span className="text-[#e06c75]">target</span>):
        <span className="text-[#e06c75]">hash_map</span> = {'{}'}
        <span className="text-[#c678dd]">for</span> <span className="text-[#e06c75]">i</span>, <span className="text-[#e06c75]">n</span> <span className="text-[#c678dd]">in</span> <span className="text-[#56b6c2]">enumerate</span>(<span className="text-[#e06c75]">nums</span>):
            <span className="text-[#e06c75]">diff</span> = <span className="text-[#e06c75]">target</span> - <span className="text-[#e06c75]">n</span>
            <span className="text-[#c678dd]">if</span> <span className="text-[#e06c75]">diff</span> <span className="text-[#c678dd]">in</span> <span className="text-[#e06c75]">hash_map</span>:
                <span className="text-[#c678dd]">return</span> [<span className="text-[#e06c75]">hash_map</span>[<span className="text-[#e06c75]">diff</span>], <span className="text-[#e06c75]">i</span>]
            <span className="text-[#e06c75]">hash_map</span>[<span className="text-[#e06c75]">n</span>] = <span className="text-[#e06c75]">i</span>
          </pre>
          <div className="absolute inset-x-0 bottom-6 flex justify-center z-20">
             <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-md">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Accepted
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-[#131418] border-t border-surface-variant px-4 py-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2 text-error">
           <span className="material-symbols-outlined text-[16px]">cancel</span> 
           <span className="font-semibold">Wrong Answer</span>
           <span className="text-on-surface-variant ml-1 font-normal opacity-70">2 submissions</span>
        </div>
        
        <div className="flex-1 max-w-[150px] mx-4">
           <div className="flex justify-between text-[10px] text-on-surface-variant mb-1 font-code-sm">
             <span>Testcases</span>
             <span>7 / 15</span>
           </div>
           <div className="w-full h-1 bg-surface-variant rounded-full overflow-hidden">
             <div className="h-full bg-error w-[46%] rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
           </div>
        </div>

        <div className="flex items-center gap-2 text-emerald-400">
           <span className="text-on-surface-variant mr-1 font-normal opacity-70">3 submissions</span>
           <span className="font-semibold">Accepted</span>
           <span className="material-symbols-outlined text-[16px]">emoji_events</span> 
        </div>
      </div>
    </div>
  );
};
