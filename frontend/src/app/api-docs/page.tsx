export default function ApiDocsPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tighter">
          API Documentation
        </h1>
        <div className="bg-surface-container-low border border-surface-variant p-8 rounded-lg space-y-6">
          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">REST API v1</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              CodeArena offers a robust REST API for integrating leaderboard statistics, matchmaking states, and user profiles 
              into your own dashboards or Discord bots. Authentication is required via API Keys.
            </p>
            <div className="mt-4 p-4 bg-surface-dim border border-surface-variant rounded flex items-center">
              <span className="font-code-md text-code-md text-primary">GET /api/v1/leaderboard</span>
            </div>
          </section>
          
          <section className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">WebSocket Events</h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Real-time socket.io connections are supported under the <code className="font-code-md bg-surface-variant px-1 rounded">/battle</code> namespace. 
              Listen to events such as <code className="font-code-md bg-surface-variant px-1 rounded">BATTLE_START</code> and <code className="font-code-md bg-surface-variant px-1 rounded">CODE_UPDATE</code>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
