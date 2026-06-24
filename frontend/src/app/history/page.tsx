"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function HistoryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await api.get('/battles');
        if (res.data.success) {
          setHistory(res.data.data.battles);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchHistory();
  }, [isAuthenticated]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 font-body-md text-on-surface">
      
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-[28px] md:text-[32px] font-bold tracking-tight text-on-surface mb-2">
          Combat History
        </h1>
        <p className="font-code-sm text-sm text-on-surface-variant">
          A comprehensive telemetry log of your past engagements and performance metrics.
        </p>
      </div>

      {/* History Table */}
      <div className="bg-surface-container border border-surface-variant rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant animate-pulse">
            Decrypting combat logs...
          </div>
        ) : history.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
            <span className="material-symbols-outlined text-[48px] text-surface-bright">history_toggle_off</span>
            <div className="text-on-surface-variant">No historical data found. Deploy into the Arena to generate telemetry.</div>
            <Link href="/arena" className="mt-2 bg-primary text-on-primary px-6 py-2 rounded font-label-caps text-xs tracking-widest uppercase hover:bg-primary-fixed transition-colors">
              Find Match
            </Link>
          </div>
        ) : (
          <div className="p-4 md:p-6 flex flex-col gap-4">
            {history.map((battle, i) => {
              const isCompleted = battle.status === 'COMPLETED';
              const visualWin = isCompleted || battle.status === 'IN_PROGRESS';
              const isDraw = battle.result?.winReason === 'TIMEOUT';
              
              let titleStatus = <span className="text-primary">{battle.status}</span>;
              if (isCompleted) {
                 titleStatus = isDraw ? <span className="text-on-surface-variant">Draw</span> : <span className="text-emerald-400">Match Completed</span>;
              }

              return (
                <div key={battle.battleCode || i} className="bg-surface-container-low border border-surface-variant rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group">
                  <div className="flex flex-col">
                    <span className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                      {titleStatus}
                      <span className="text-on-surface-variant font-normal text-sm font-code-sm ml-2 px-2 py-0.5 rounded bg-surface-variant/30 border border-surface-variant">
                        {battle.battleMode} • {battle.battleType}
                      </span>
                    </span>
                    <span className="text-on-surface-variant text-sm font-code-sm mt-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {formatDate(battle.createdAt)}
                    </span>
                  </div>
                  
                  <Link 
                    href={isCompleted ? `/replay/${battle._id || battle.battleCode}` : `/battle/${battle.battleCode}`} 
                    className="flex items-center gap-2 text-primary hover:text-primary-fixed font-label-caps tracking-widest text-xs uppercase bg-primary/10 px-4 py-2.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all whitespace-nowrap w-fit"
                  >
                    {isCompleted ? 'View Replay' : 'Enter Battle'} <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
