"use client";

import { useEffect, useState } from 'react';

type SystemStatus = {
  status: 'ok' | 'error' | 'loading';
  checks: {
    mongo: 'ok' | 'error' | 'loading';
    redis: 'ok' | 'error' | 'loading';
    Piston: 'ok' | 'error' | 'loading';
    gateway: 'ok' | 'error' | 'loading';
  };
};

export default function StatusPage() {
  const [data, setData] = useState<SystemStatus>({
    status: 'loading',
    checks: {
      mongo: 'loading',
      redis: 'loading',
      Piston: 'loading',
      gateway: 'loading',
    }
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        let url = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        try {
          url = new URL(url).origin;
        } catch (e) {
          url = 'http://localhost:4000';
        }
        
        const res = await fetch(`${url}/api/health/ready`);
        // The API returns JSON even on 503
        const json = await res.json();
        if (json && json.checks) {
          setData(json);
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        setData({
          status: 'error',
          checks: {
            mongo: 'error',
            redis: 'error',
            Piston: 'error',
            gateway: 'error',
          }
        });
      }
    };
    
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      default: return 'text-amber-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'Operational';
      case 'error': return 'Degraded / Down';
      default: return 'Checking...';
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="font-headline-xl text-headline-xl font-bold text-primary tracking-tighter">
          System Status
        </h1>
        <div className="bg-surface-container-low border border-surface-variant p-8 rounded-lg space-y-6">
          <div className={`flex items-center gap-4 p-4 bg-surface-dim border rounded-lg ${data.status === 'ok' ? 'border-emerald-500/30' : data.status === 'loading' ? 'border-amber-500/30' : 'border-red-500/30'}`}>
            <span className={`w-3 h-3 rounded-full animate-pulse ${data.status === 'ok' ? 'bg-emerald-500' : data.status === 'loading' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            <span className="font-title-md text-title-md text-on-surface">
              {data.status === 'ok' ? 'All Systems Operational' : data.status === 'loading' ? 'Checking Systems...' : 'Some Systems Degraded'}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b border-surface-variant">
              <span className="font-body-md text-body-md text-on-surface">Code Execution Cluster (Piston)</span>
              <span className={`font-label-caps text-label-caps ${getStatusColor(data.checks.Piston)}`}>
                {getStatusText(data.checks.Piston)}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-variant">
              <span className="font-body-md text-body-md text-on-surface">Matchmaking Service (Redis)</span>
              <span className={`font-label-caps text-label-caps ${getStatusColor(data.checks.redis)}`}>
                {getStatusText(data.checks.redis)}
              </span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-variant">
              <span className="font-body-md text-body-md text-on-surface">Database (MongoDB)</span>
              <span className={`font-label-caps text-label-caps ${getStatusColor(data.checks.mongo)}`}>
                {getStatusText(data.checks.mongo)}
              </span>
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="font-body-md text-body-md text-on-surface">WebSocket Gateway</span>
              <span className={`font-label-caps text-label-caps ${getStatusColor(data.checks.gateway)}`}>
                {getStatusText(data.checks.gateway)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
