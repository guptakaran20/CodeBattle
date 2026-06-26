"use client";

import React, { useState } from 'react';
import { 
  Server, Zap, Code2, Shield, Activity, Users, Trophy, Brain,
  ChevronRight, Terminal, Globe, Lock
} from 'lucide-react';

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState('rest');

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 md:px-8 font-body-md">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-label-caps tracking-widest uppercase mb-6">
          <Server size={14} /> Developer Documentation
        </div>
        <h1 className="text-5xl md:text-7xl font-headline-lg font-bold tracking-tight text-on-surface mb-6">
          CodeArena API
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          Integrate with our platform, build custom clients, or contribute to the ecosystem. Explore our REST endpoints and real-time WebSocket events.
        </p>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2 relative">
          <div className="sticky top-24 space-y-2">
            <button 
              onClick={() => setActiveTab('rest')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'rest' ? 'bg-primary/10 text-primary border border-primary/20' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Globe size={18} /> REST API
              </div>
              <ChevronRight size={16} className={`transition-transform ${activeTab === 'rest' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>

            <button 
              onClick={() => setActiveTab('websockets')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'websockets' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Zap size={18} /> WebSockets
              </div>
              <ChevronRight size={16} className={`transition-transform ${activeTab === 'websockets' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>

            <button 
              onClick={() => setActiveTab('authentication')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'authentication' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Shield size={18} /> Authentication
              </div>
              <ChevronRight size={16} className={`transition-transform ${activeTab === 'authentication' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-8 duration-500">
          
          {/* REST API SECTION */}
          {activeTab === 'rest' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-headline-lg font-bold text-on-surface mb-4">REST API Reference</h2>
                <p className="text-on-surface-variant mb-8">All HTTP endpoints operate over HTTPS and accept JSON payloads. Base URL: <code className="bg-surface-container px-2 py-1 rounded text-primary">/api</code></p>
              </div>

              {/* Endpoint Group: Auth */}
              <EndpointGroup title="Authentication" icon={<Shield className="text-emerald-500" />}>
                <Endpoint method="POST" path="/auth/login" desc="Authenticate a user and return a JWT cookie." />
                <Endpoint method="POST" path="/auth/register" desc="Create a new user account." />
                <Endpoint method="GET" path="/auth/me" desc="Retrieve the currently authenticated user's profile." />
              </EndpointGroup>

              {/* Endpoint Group: Battles */}
              <EndpointGroup title="Battles & Matchmaking" icon={<Activity className="text-primary" />}>
                <Endpoint method="POST" path="/matchmaking/join" desc="Join the global matchmaking queue." />
                <Endpoint method="POST" path="/matchmaking/leave" desc="Leave the matchmaking queue." />
                <Endpoint method="POST" path="/battles/create" desc="Create a custom battle room (invite only)." />
                <Endpoint method="GET" path="/battles/:id" desc="Retrieve details of a specific battle." />
                <Endpoint method="POST" path="/battles/:id/submit" desc="Submit code for evaluation against the battle's test suite." />
                <Endpoint method="GET" path="/battles/:id/replay" desc="Fetch replay telemetry for a completed battle." />
              </EndpointGroup>

              {/* Endpoint Group: Users & Leaderboard */}
              <EndpointGroup title="Social & Ranking" icon={<Trophy className="text-amber-500" />}>
                <Endpoint method="GET" path="/users/:id" desc="Fetch a public user profile." />
                <Endpoint method="GET" path="/leaderboard" desc="Retrieve the global Elo rankings." />
              </EndpointGroup>

              {/* Endpoint Group: Tournaments */}
              <EndpointGroup title="Tournaments" icon={<Users className="text-purple-500" />}>
                <Endpoint method="POST" path="/tournaments/create" desc="Admin only: Create a new tournament bracket." />
                <Endpoint method="GET" path="/tournaments/:id" desc="Get tournament details and current standings." />
              </EndpointGroup>

              {/* Endpoint Group: AI Integrations */}
              <EndpointGroup title="AI Integrations" icon={<Brain className="text-rose-500" />}>
                <Endpoint method="POST" path="/ai/review" desc="Get an AI code review for a specific battle submission." />
                <Endpoint method="POST" path="/ai/interview" desc="Start a mock technical interview session." />
                <Endpoint method="POST" path="/ai/similar-problems" desc="Generate variations of a specific problem." />
              </EndpointGroup>
            </div>
          )}

          {/* WEBSOCKETS SECTION */}
          {activeTab === 'websockets' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-headline-lg font-bold text-on-surface mb-4">Real-Time WebSockets</h2>
                <p className="text-on-surface-variant mb-8">CodeArena utilizes Socket.io for low-latency real-time synchronization during battles. Connect to the socket server at the root namespace <code className="bg-surface-container px-2 py-1 rounded text-amber-500">/</code>.</p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Client -> Server */}
                <div className="bg-surface-container border border-surface-variant rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-surface-container-low px-6 py-4 border-b border-surface-variant font-semibold flex items-center gap-2">
                    <Terminal size={18} className="text-primary" /> Client to Server (Emits)
                  </div>
                  <div className="p-6 space-y-4">
                    <EventItem name="queue:join" desc="Request to enter the matchmaking queue." />
                    <EventItem name="queue:leave" desc="Cancel matchmaking request." />
                    <EventItem name="battle:create" desc="Initialize a new custom room." />
                    <EventItem name="battle:join" desc="Join an existing battle via ID." />
                    <EventItem name="room:ready" desc="Signal readiness to start the battle." />
                    <EventItem name="submission:send" desc="Notify the server of a code submission attempt." />
                    <EventItem name="chat:send" desc="Broadcast a chat message to the room." />
                  </div>
                </div>

                {/* Server -> Client */}
                <div className="bg-surface-container border border-surface-variant rounded-2xl overflow-hidden shadow-lg">
                  <div className="bg-surface-container-low px-6 py-4 border-b border-surface-variant font-semibold flex items-center gap-2">
                    <Server size={18} className="text-amber-500" /> Server to Client (Listeners)
                  </div>
                  <div className="p-6 space-y-4">
                    <EventItem name="battle:started" desc="Fired when all players are ready. Provides problem details." />
                    <EventItem name="battle:timer" desc="Syncs the battle countdown clock." />
                    <EventItem name="battle:update" desc="Broadcasts state changes (e.g., player progress)." />
                    <EventItem name="submission:result" desc="Returns execution results from Judge0." />
                    <EventItem name="battle:winner" desc="Announces the winner and triggers the end-screen." />
                    <EventItem name="player:joined" desc="Fired when a new participant enters the room." />
                    <EventItem name="player:left" desc="Fired when a participant disconnects." />
                    <EventItem name="tournament:update" desc="Real-time bracket progression updates." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AUTHENTICATION SECTION */}
          {activeTab === 'authentication' && (
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-headline-lg font-bold text-on-surface mb-4">Authentication Flow</h2>
                <p className="text-on-surface-variant mb-8">CodeArena utilizes HTTP-only cookies for secure authentication. You do not need to manually attach Bearer tokens to your API requests if you are operating on the same domain.</p>
              </div>

              <div className="bg-surface-container border border-surface-variant rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                    <Lock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Standard Login</h3>
                    <p className="text-sm text-on-surface-variant">Credentials-based authentication flow.</p>
                  </div>
                </div>
                
                <div className="bg-[#1e1e1e] p-6 rounded-xl border border-surface-variant font-code-sm text-sm overflow-x-auto text-gray-300">
                  <pre className="min-w-full w-max">
<span className="text-purple-400">const</span> response = <span className="text-purple-400">await</span> <span className="text-blue-400">fetch</span>(<span className="text-emerald-400">`/api/auth/login`</span>, {'{'}
  method: <span className="text-emerald-400">'POST'</span>,
  headers: {'{'}
    <span className="text-emerald-400">'Content-Type'</span>: <span className="text-emerald-400">'application/json'</span>
  {'}'},
  body: <span className="text-blue-400">JSON</span>.<span className="text-blue-400">stringify</span>({'{'}
    email: <span className="text-emerald-400">'developer@codearena.com'</span>,
    password: <span className="text-emerald-400">'secure_password'</span>
  {'}'})
{'}'});

<span className="text-gray-500">// The server responds with a Set-Cookie header containing the JWT token.</span>
<span className="text-gray-500">// Subsequent requests will automatically include this cookie.</span>
                  </pre>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Subcomponents for cleaner code

function EndpointGroup({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-surface-container border border-surface-variant rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-surface-container-low px-6 py-4 border-b border-surface-variant font-headline-lg font-semibold flex items-center gap-3 text-lg">
        {icon}
        {title}
      </div>
      <div className="divide-y divide-surface-variant">
        {children}
      </div>
    </div>
  );
}

function Endpoint({ method, path, desc }: { method: string, path: string, desc: string }) {
  const methodColor = {
    GET: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    POST: 'bg-primary/10 text-primary border-primary/20',
    PUT: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    DELETE: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  }[method] || 'bg-surface-variant text-on-surface';

  return (
    <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 hover:bg-surface-variant/30 transition-colors group">
      <div className="flex items-center gap-4 min-w-[280px]">
        <span className={`px-2 py-1 rounded text-xs font-bold font-code-sm border ${methodColor} w-[60px] text-center shrink-0`}>
          {method}
        </span>
        <code className="text-sm font-code-sm text-on-surface bg-background px-2 py-1 rounded border border-surface-variant group-hover:border-primary/30 transition-colors">
          {path}
        </code>
      </div>
      <div className="text-sm text-on-surface-variant font-body-sm">
        {desc}
      </div>
    </div>
  );
}

function EventItem({ name, desc }: { name: string, desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <code className="text-xs font-code-sm bg-background px-2 py-1 rounded border border-surface-variant shrink-0 mt-0.5">
        {name}
      </code>
      <span className="text-sm text-on-surface-variant font-body-sm leading-relaxed">
        {desc}
      </span>
    </div>
  );
}
