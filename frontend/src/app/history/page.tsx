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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low">
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal tracking-widest uppercase">Engagement ID</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal tracking-widest uppercase">Format</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal tracking-widest uppercase">Status</th>
                  <th className="py-4 px-6 font-code-sm text-xs text-on-surface-variant font-normal tracking-widest uppercase text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {history.map((battle, i) => {
                  const isCompleted = battle.status === 'COMPLETED';
                  const displayStatus = isCompleted ? 'Win' : battle.status;
                  const visualWin = isCompleted || battle.status === 'IN_PROGRESS';

                  return (
                    <tr key={battle.battleCode || i} className="hover:bg-surface-container-high transition-colors group">
                      <td className="py-4 px-6">
                        <Link href={`/battle/${battle.battleCode}`} className="font-code-sm text-sm text-primary hover:text-primary-fixed transition-colors underline decoration-primary/30 underline-offset-4">
                          {battle.battleCode}
                        </Link>
                      </td>
                      <td className="py-4 px-6 font-code-sm text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                        {battle.battleMode} • {battle.battleType}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-code-sm border ${
                          visualWin ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-error/10 border-error/30 text-error'
                        }`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-code-sm text-sm text-on-surface-variant text-right">
                        {formatDate(battle.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
