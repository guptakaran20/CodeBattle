export default function StatusPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tighter">
          System Status
        </h1>
        <div className="bg-surface-container-low border border-surface-variant p-8 rounded-lg space-y-6">
          <div className="flex items-center gap-4 p-4 bg-surface-dim border border-emerald-500/30 rounded-lg">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-title-md text-title-md text-on-surface">All Systems Operational</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-surface-variant">
              <span className="font-body-md text-body-md text-on-surface">Code Execution Cluster (Judge0)</span>
              <span className="font-label-caps text-label-caps text-emerald-400">Operational</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-variant">
              <span className="font-body-md text-body-md text-on-surface">Matchmaking Service (Redis)</span>
              <span className="font-label-caps text-label-caps text-emerald-400">Operational</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-variant">
              <span className="font-body-md text-body-md text-on-surface">Database (MongoDB)</span>
              <span className="font-label-caps text-label-caps text-emerald-400">Operational</span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="font-body-md text-body-md text-on-surface">WebSocket Gateway</span>
              <span className="font-label-caps text-label-caps text-emerald-400">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
