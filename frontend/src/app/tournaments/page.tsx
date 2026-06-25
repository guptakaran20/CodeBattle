"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface Tournament {
  _id: string;
  name: string;
  description: string;
  startTime: string;
  maxParticipants: number;
  status: 'REGISTRATION' | 'CHECK_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  currentParticipantsCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await api.get('/tournaments');
        if (res.data.success) {
          setTournaments(res.data.data.tournaments);
        }
      } catch (error) {
        console.error('Failed to load tournaments', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REGISTRATION':
        return <span className="bg-primary/10 border border-primary/30 text-primary px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Open</span>;
      case 'CHECK_IN':
        return <span className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Check-In</span>;
      case 'IN_PROGRESS':
        return <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Live</span>;
      case 'COMPLETED':
        return <span className="bg-surface-variant/50 border border-surface-variant text-on-surface-variant px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Completed</span>;
      default:
        return <span className="bg-error/10 border border-error/30 text-error px-3 py-1 rounded text-xs font-label-caps uppercase tracking-widest font-bold">Cancelled</span>;
    }
  };

  const getDifficultyColor = (diff: string) => {
    if (diff === 'EASY') return 'text-emerald-400';
    if (diff === 'MEDIUM') return 'text-primary';
    if (diff === 'HARD') return 'text-error';
    return 'text-on-surface-variant';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mock tournaments if none exist from the API, to keep the visual aesthetic alive
  const displayTournaments = tournaments.length > 0 ? tournaments : [
    {
      _id: 't_mock_1',
      name: 'Global CodeFest 2026',
      description: 'The ultimate battle of algorithmic supremacy. 128 players enter, one leaves as Champion.',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      maxParticipants: 128,
      status: 'REGISTRATION',
      currentParticipantsCount: 42,
      difficulty: 'HARD'
    },
    {
      _id: 't_mock_2',
      name: 'Weekly Blitz Arena',
      description: 'Fast-paced algorithmic challenges. Quick thinking is the only way to survive.',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      maxParticipants: 32,
      status: 'IN_PROGRESS',
      currentParticipantsCount: 32,
      difficulty: 'MEDIUM'
    },
    {
      _id: 't_mock_3',
      name: 'Rookie Circuit',
      description: 'A beginner friendly tournament to get your feet wet in competitive coding.',
      startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      maxParticipants: 64,
      status: 'COMPLETED',
      currentParticipantsCount: 64,
      difficulty: 'EASY'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-[1280px] mx-auto">
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[100px] pointer-events-none rounded-full"></div>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight relative z-10">Tournaments</h1>
        <p className="text-on-surface-variant max-w-2xl mx-auto font-body-md relative z-10">Compete in massive multi-stage brackets. Win exclusive titles, huge Elo boosts, and ultimate bragging rights.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayTournaments.map((t: any) => (
          <div key={t._id} className="bg-surface-container border border-surface-variant rounded-xl p-6 flex flex-col hover:border-surface-bright hover:shadow-[0_4px_20px_rgba(255,193,116,0.05)] transition-all group relative overflow-hidden">
             
             {/* Glow background for Live tournaments */}
             {t.status === 'IN_PROGRESS' && (
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none rounded-full"></div>
             )}

             <div className="flex justify-between items-start mb-4 relative z-10">
               {getStatusBadge(t.status)}
               <span className={`font-label-caps text-xs tracking-widest uppercase font-bold ${getDifficultyColor(t.difficulty)}`}>{t.difficulty || 'MIXED'}</span>
             </div>
             
             <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2 relative z-10 group-hover:text-primary transition-colors">{t.name}</h2>
             <p className="text-on-surface-variant text-sm mb-6 flex-1 relative z-10">{t.description}</p>
             
             <div className="space-y-3 mb-6 relative z-10">
               <div className="flex justify-between items-center bg-surface-container-low p-3 rounded border border-surface-variant">
                 <span className="font-code-sm text-xs text-on-surface-variant uppercase">Starts</span>
                 <span className="font-code-sm text-sm text-on-surface font-semibold">
                   {new Date(t.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                 </span>
               </div>
               <div className="flex justify-between items-center bg-surface-container-low p-3 rounded border border-surface-variant">
                 <span className="font-code-sm text-xs text-on-surface-variant uppercase">Players</span>
                 <span className="font-code-sm text-sm text-on-surface font-semibold">{t.currentParticipantsCount || 0} / {t.maxParticipants}</span>
               </div>
             </div>

             <div className="mt-auto relative z-10">
               {t.status === 'REGISTRATION' ? (
                 <button className="w-full py-3 bg-primary text-on-primary font-label-caps text-xs uppercase tracking-widest font-bold rounded shadow-[0_0_15px_rgba(255,193,116,0.2)] hover:opacity-90 transition-opacity">
                   Register Now
                 </button>
               ) : t.status === 'IN_PROGRESS' ? (
                 <button className="w-full py-3 bg-surface-variant text-on-surface font-label-caps text-xs uppercase tracking-widest font-bold rounded hover:bg-surface-bright transition-colors flex justify-center items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">visibility</span> Spectate
                 </button>
               ) : (
                 <button className="w-full py-3 bg-surface-container-low border border-surface-variant text-on-surface-variant font-label-caps text-xs uppercase tracking-widest font-bold rounded cursor-not-allowed">
                   {t.status === 'COMPLETED' ? 'Tournament Concluded' : 'Registration Closed'}
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
