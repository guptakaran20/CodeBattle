"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Tournament, TournamentStatus, TournamentDifficulty } from '@/types/tournament';
import { TournamentCard } from '@/components/tournaments/TournamentCard';

export default function TournamentsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tournaments');
      if (res.data.success) {
        setTournaments(res.data.data.tournaments);
      }
    } catch (err) {
      console.error('Failed to load tournaments', err);
      setError('Failed to load tournaments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  // Mock tournaments if none exist from the API, to keep the visual aesthetic alive
  const displayTournaments = tournaments.length > 0 ? tournaments : [
    {
      _id: 't_mock_1',
      title: 'Global CodeFest 2026',
      slug: 'global-codefest-2026',
      shortId: 'TC-1',
      description: 'The ultimate battle of algorithmic supremacy. 128 players enter, one leaves as Champion.',
      startTime: new Date(Date.now() + 86400000).toISOString(),
      maxParticipants: 128,
      status: TournamentStatus.REGISTRATION,
      currentParticipantsCount: 42,
      difficulty: TournamentDifficulty.HARD,
      isRegistered: false,
    },
    {
      _id: 't_mock_2',
      title: 'Weekly Blitz Arena',
      slug: 'weekly-blitz-arena',
      shortId: 'TC-2',
      description: 'Fast-paced algorithmic challenges. Quick thinking is the only way to survive.',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      maxParticipants: 32,
      status: TournamentStatus.IN_PROGRESS,
      currentParticipantsCount: 32,
      difficulty: TournamentDifficulty.MEDIUM,
      isRegistered: true,
    },
    {
      _id: 't_mock_3',
      title: 'Rookie Circuit',
      slug: 'rookie-circuit',
      shortId: 'TC-3',
      description: 'A beginner friendly tournament to get your feet wet in competitive coding.',
      startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      maxParticipants: 64,
      status: TournamentStatus.COMPLETED,
      currentParticipantsCount: 64,
      difficulty: TournamentDifficulty.EASY,
      isRegistered: false,
    }
  ] as Tournament[];

  return (
    <>
      {/* Auth Overlay */}
      {!authLoading && !isAuthenticated && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container border border-surface-variant p-10 rounded-xl flex flex-col items-center justify-center shadow-2xl text-center w-full max-w-[420px] h-auto m-auto">
            <div className="w-16 h-16 shrink-0 rounded-full bg-surface-variant flex items-center justify-center mb-4">
               <span className="material-symbols-outlined text-[32px] text-primary">lock</span>
            </div>
            <h2 className="text-2xl font-bold font-headline-lg mb-2">Sign In to Continue</h2>
            <p className="text-on-surface-variant text-sm mb-8 w-full" style={{ wordBreak: 'normal', whiteSpace: 'normal' }}>
              You must log in to view and register for tournaments.
            </p>
            <Link href="/login" className="w-full py-3 bg-primary text-on-primary rounded font-label-caps text-xs uppercase tracking-widest hover:opacity-90 transition-opacity pointer-events-auto font-bold">
               Log In To Access
            </Link>
          </div>
        </div>
      )}

      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-[1280px] mx-auto">
        <div className="text-center mb-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[100px] pointer-events-none rounded-full"></div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight relative z-10">Tournaments</h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body-md relative z-10">Compete in massive multi-stage brackets. Win exclusive titles, huge Elo boosts, and ultimate bragging rights.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container border border-surface-variant rounded-xl p-6 h-[350px] animate-pulse">
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-16 h-6 bg-surface-variant rounded"></div>
                   <div className="w-16 h-6 bg-surface-variant rounded"></div>
                 </div>
                 <div className="w-3/4 h-8 bg-surface-variant rounded mb-2"></div>
                 <div className="w-full h-12 bg-surface-variant rounded mb-6"></div>
                 <div className="space-y-3 mb-6">
                   <div className="w-full h-10 bg-surface-container-low rounded border border-surface-variant"></div>
                   <div className="w-full h-10 bg-surface-container-low rounded border border-surface-variant"></div>
                 </div>
                 <div className="w-full h-12 bg-surface-variant rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-surface-container border border-surface-variant rounded-xl">
            <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
            <h3 className="text-xl font-bold font-headline-lg mb-2">Error Loading Tournaments</h3>
            <p className="text-on-surface-variant mb-6">{error}</p>
            <button onClick={fetchTournaments} className="px-6 py-2 bg-primary text-on-primary rounded font-bold font-label-caps uppercase tracking-widest text-xs hover:opacity-90 transition-opacity">
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayTournaments.map((t) => (
              <TournamentCard 
                key={t._id} 
                tournament={t} 
                onRegistrationSuccess={fetchTournaments} 
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
