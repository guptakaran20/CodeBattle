import React from 'react';

export const AISection = () => {
  return (
    <section className="flex flex-col md:flex-row items-center gap-12 w-full py-0">
      <div className="flex flex-col gap-6 w-full md:w-1/2">
        <h2 className="font-label-caps uppercase tracking-widest text-emerald-400 text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">psychology</span> AI-Powered Insights
        </h2>
        <h3 className="font-headline-lg text-4xl md:text-5xl font-extrabold text-on-surface leading-tight">
          Level up faster with intelligent code reviews
        </h3>
        <p className="font-body-md text-on-surface-variant text-lg leading-relaxed">
          Winning isn't everything. It's about how you win. Our proprietary AI engine analyzes every submission to provide instant feedback on time complexity, space optimization, and code cleanliness.
        </p>
        
        <ul className="flex flex-col gap-4 mt-4">
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-400 mt-1">check_circle</span>
            <div className="flex flex-col">
              <span className="font-title-md font-bold text-on-surface">Time Complexity Analysis</span>
              <span className="font-body-sm text-on-surface-variant">Identify bottlenecks and optimize from O(n²) to O(n log n).</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-400 mt-1">check_circle</span>
            <div className="flex flex-col">
              <span className="font-title-md font-bold text-on-surface">Space Optimization</span>
              <span className="font-body-sm text-on-surface-variant">Get hints on how to reduce memory footprint without sacrificing speed.</span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-400 mt-1">check_circle</span>
            <div className="flex flex-col">
              <span className="font-title-md font-bold text-on-surface">Clean Code Suggestions</span>
              <span className="font-body-sm text-on-surface-variant">Learn industry-standard patterns and idiomatic syntax.</span>
            </div>
          </li>
        </ul>
      </div>

      <div className="w-full md:w-1/2 relative perspective-[1000px]">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        
        {/* Mock UI Container */}
        <div className="relative bg-[#131418] border border-surface-variant rounded-2xl overflow-hidden shadow-2xl transform md:rotate-y-[-5deg] md:rotate-x-[5deg] transition-transform duration-500 hover:rotate-0">
          
          {/* Header */}
          <div className="bg-surface-container-low border-b border-surface-variant px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[18px]">psychology</span>
              <span className="font-label-caps text-xs text-on-surface font-bold uppercase tracking-widest">Arena AI Report</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
              <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
              <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-6">
            
            {/* Original Code Snippet */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-xs text-on-surface-variant">Your Submission (O(n²))</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-label-caps text-[10px] font-bold">Suboptimal</span>
              </div>
              <pre className="bg-[#0e0e11] border border-surface-variant p-4 rounded-xl overflow-x-auto font-code-sm text-sm text-on-surface/80">
<code><span className="text-purple-400">for</span> (<span className="text-blue-400">let</span> i = <span className="text-orange-400">0</span>; i &lt; nums.length; i++) {'{'}
  <span className="text-purple-400">for</span> (<span className="text-blue-400">let</span> j = i + <span className="text-orange-400">1</span>; j &lt; nums.length; j++) {'{'}
    <span className="text-purple-400">if</span> (nums[i] + nums[j] === target) <span className="text-purple-400">return</span> [i, j];
  {'}'}
{'}'}</code>
              </pre>
            </div>

            {/* AI Suggestion */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-code-sm text-xs text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span> Suggested (O(n))
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-label-caps text-[10px] font-bold">Optimized</span>
              </div>
              <div className="relative">
                <pre className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl overflow-x-auto font-code-sm text-sm text-on-surface">
<code><span className="text-blue-400">const</span> map = <span className="text-purple-400">new</span> <span className="text-yellow-400">Map</span>();
<span className="text-purple-400">for</span> (<span className="text-blue-400">let</span> i = <span className="text-orange-400">0</span>; i &lt; nums.length; i++) {'{'}
  <span className="text-blue-400">const</span> diff = target - nums[i];
  <span className="text-purple-400">if</span> (map.<span className="text-yellow-400">has</span>(diff)) <span className="text-purple-400">return</span> [map.<span className="text-yellow-400">get</span>(diff), i];
  map.<span className="text-yellow-400">set</span>(nums[i], i);
{'}'}</code>
                </pre>
                
                {/* AI Typewriter Effect Badge */}
                <div className="absolute -bottom-3 right-4 bg-surface-container-high border border-surface-variant px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-bounce-slow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-body-sm text-[10px] text-on-surface-variant font-bold">AI generating...</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
