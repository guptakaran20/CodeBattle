export default function ApiDocsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="font-headline-xl text-4xl md:text-5xl font-bold text-primary tracking-tighter mb-4">
            CodeArena Developer Docs
          </h1>
          <p className="font-body-md text-lg text-on-surface-variant max-w-2xl mx-auto">
            An overview of the frontend architecture, key API integrations, and highlights of where you can start making impactful contributions to the platform.
          </p>
        </div>

        {/* Section 1: Frontend Pages */}
        <div className="bg-surface-container border border-surface-variant p-8 rounded-xl space-y-6 shadow-lg">
          <h2 className="font-headline-lg text-2xl text-on-surface border-b border-surface-variant pb-4">
            <span className="material-symbols-outlined align-middle mr-2 text-primary">folder</span>
            Frontend Pages Structure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-emerald-400 font-label-caps tracking-widest text-sm uppercase">Public & Auth</h3>
              <ul className="space-y-2 text-on-surface-variant text-sm font-body-sm">
                <li><code className="text-primary bg-primary/10 px-1 rounded">/</code> - Landing Page (Hero, Features, AI Demo)</li>
                <li><code className="text-primary bg-primary/10 px-1 rounded">/login</code> & <code className="text-primary bg-primary/10 px-1 rounded">/register</code></li>
                <li><code className="text-primary bg-primary/10 px-1 rounded">/terms</code>, <code className="text-primary bg-primary/10 px-1 rounded">/privacy</code>, <code className="text-primary bg-primary/10 px-1 rounded">/status</code></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-amber-400 font-label-caps tracking-widest text-sm uppercase">Dashboard & User Hub</h3>
              <ul className="space-y-2 text-on-surface-variant text-sm font-body-sm">
                <li><code className="text-primary bg-primary/10 px-1 rounded">/dashboard</code> - Overview & Quick actions</li>
                <li><code className="text-primary bg-primary/10 px-1 rounded">/profile</code> - User settings</li>
                <li><code className="text-primary bg-primary/10 px-1 rounded">/performance</code> - Detailed telemetry</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-blue-400 font-label-caps tracking-widest text-sm uppercase">Core Arena & Gameplay</h3>
              <ul className="space-y-2 text-on-surface-variant text-sm font-body-sm">
                <li><code className="text-primary bg-primary/10 px-1 rounded">/arena</code> - Matchmaking hub</li>
                <li><code className="text-primary bg-primary/10 px-1 rounded">/battle/[id]</code> - Live battle interface</li>
                <li><code className="text-primary bg-primary/10 px-1 rounded">/tournaments</code> - Event brackets</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-purple-400 font-label-caps tracking-widest text-sm uppercase">Administration</h3>
              <ul className="space-y-2 text-on-surface-variant text-sm font-body-sm">
                <li><code className="text-primary bg-primary/10 px-1 rounded">/admin</code> - Backend control panel</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Core API Endpoints */}
        <div className="bg-surface-container border border-surface-variant p-8 rounded-xl space-y-6 shadow-lg">
          <h2 className="font-headline-lg text-2xl text-on-surface border-b border-surface-variant pb-4">
            <span className="material-symbols-outlined align-middle mr-2 text-primary">api</span>
            Core API Endpoints
          </h2>
          <p className="font-body-sm text-on-surface-variant">
            The frontend communicates with the backend via a centralized Axios instance. Here are the most heavily utilized endpoints:
          </p>
          <div className="space-y-4">
             <div className="bg-surface-container-low p-4 rounded border border-surface-variant">
               <h3 className="font-bold text-on-surface mb-2 font-label-caps text-sm tracking-widest">Authentication & Users</h3>
               <div className="flex flex-wrap gap-2">
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">POST /auth/login</span>
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">GET /auth/me</span>
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">GET /users/:username</span>
               </div>
             </div>
             <div className="bg-surface-container-low p-4 rounded border border-surface-variant">
               <h3 className="font-bold text-on-surface mb-2 font-label-caps text-sm tracking-widest">Battles & Matchmaking</h3>
               <div className="flex flex-wrap gap-2">
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">GET /battles</span>
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">POST /battles/queue</span>
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">POST /battles/custom</span>
               </div>
             </div>
             <div className="bg-surface-container-low p-4 rounded border border-surface-variant">
               <h3 className="font-bold text-on-surface mb-2 font-label-caps text-sm tracking-widest">Tournaments & Leaderboard</h3>
               <div className="flex flex-wrap gap-2">
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">GET /tournaments</span>
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">POST /tournaments/:id/register</span>
                 <span className="font-code-sm text-xs bg-surface-variant text-on-surface px-2 py-1 rounded">GET /leaderboard</span>
               </div>
             </div>
          </div>
        </div>

        {/* Section 3: Contribution Points */}
        <div className="bg-surface-container border border-surface-variant p-8 rounded-xl space-y-6 shadow-[0_0_30px_rgba(255,193,116,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] pointer-events-none"></div>
          <h2 className="font-headline-lg text-2xl text-on-surface border-b border-surface-variant pb-4 relative z-10">
            <span className="material-symbols-outlined align-middle mr-2 text-primary">rocket_launch</span>
            Contribution Points
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="bg-surface-container-low p-5 rounded-lg border border-surface-variant hover:border-primary transition-colors">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">brush</span>
                Frontend & UI/UX
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-on-surface-variant marker:text-primary">
                <li><strong>Performance Visualizations:</strong> Integrate <code className="text-emerald-400">recharts</code> for Elo graphs.</li>
                <li><strong>Tournament Brackets:</strong> Build a visual bracket tree component for 32/64 player events.</li>
                <li><strong>Public Profiles:</strong> Add GitHub-style activity heatmaps.</li>
                <li><strong>Spectator Mode:</strong> Enhance the replay viewer with playback controls.</li>
              </ul>
            </div>
            
            <div className="bg-surface-container-low p-5 rounded-lg border border-surface-variant hover:border-emerald-400 transition-colors">
              <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                Core Gameplay Logic
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-sm text-on-surface-variant marker:text-emerald-400">
                <li><strong>WebRTC Tracking:</strong> Transition from WebSockets to WebRTC for zero-latency cursor mirroring.</li>
                <li><strong>AI Practice:</strong> Improve the AI generator for custom test suites.</li>
                <li><strong>WASM Sandbox:</strong> Implement secure in-browser code execution for initial test runs.</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-surface-container-low p-5 rounded-lg border border-surface-variant relative z-10 hover:border-amber-400 transition-colors">
            <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">webhook</span>
              Backend & Integrations
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-on-surface-variant marker:text-amber-400">
              <li><strong>OAuth Integrations:</strong> Add GitHub and Discord login flows.</li>
              <li><strong>Discord Bot:</strong> Create webhooks to announce tournament winners and rank promotions.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
