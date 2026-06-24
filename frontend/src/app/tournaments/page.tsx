'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {api} from '@/lib/api';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments');
      if (res.data.success) {
        setTournaments(res.data.data.tournaments);
      }
    } catch (error) {
      console.error('Failed to fetch tournaments', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-surface-variant text-on-surface-variant',
      'REGISTRATION': 'bg-primary/20 text-primary border border-primary/30',
      'CHECK_IN': 'bg-amber-500/20 text-amber-500 border border-amber-500/30',
      'IN_PROGRESS': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'COMPLETED': 'bg-surface-container-high text-on-surface',
      'CANCELLED': 'bg-error/20 text-error border border-error/30'
    };
    return `px-3 py-1 text-[10px] font-label-caps uppercase tracking-widest rounded-full font-bold ${colors[status] || colors.DRAFT}`;
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline-lg mb-2">Tournaments</h1>
          <p className="text-on-surface-variant text-lg">Compete in structured events for glory and rating boosts.</p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-surface-container border border-surface-variant rounded-2xl p-12 text-center shadow-lg">
          <div className="text-6xl mb-6 opacity-80">🏆</div>
          <h3 className="text-2xl font-bold font-headline-lg mb-2">No Tournaments Found</h3>
          <p className="text-on-surface-variant mb-6 max-w-md mx-auto">There are no active tournaments at the moment. Check back later for new competitive events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <div 
              key={t._id} 
              onClick={() => router.push(`/tournaments/${t._id}`)}
              className="bg-surface-container border border-surface-variant rounded-xl p-6 shadow-md hover:shadow-primary/20 hover:border-primary/50 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 group-hover:bg-primary/10 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <span className={getStatusBadge(t.status)}>{t.status.replace('_', ' ')}</span>
                <span className="text-xs font-code-sm px-2 py-1 bg-surface-variant rounded text-on-surface-variant">
                  {t.difficulty}
                </span>
              </div>
              
              <h3 className="text-xl font-bold font-headline-lg mb-2 group-hover:text-primary transition-colors">{t.title}</h3>
              <p className="text-sm text-on-surface-variant line-clamp-2 mb-6 flex-grow">
                {t.description || 'A competitive coding tournament.'}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-variant">
                <div>
                  <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider">Format</p>
                  <p className="font-semibold text-sm">{t.maxParticipants} Players</p>
                </div>
                <div>
                  <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider">Time / Match</p>
                  <p className="font-semibold text-sm">{t.battleDuration} mins</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
