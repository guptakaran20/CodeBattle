'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { SingleEliminationBracket, Match, SVGViewer } from '@g-loot/react-tournament-brackets';
import { io } from 'socket.io-client';

export default function TournamentDetailsPage() {
  const { id } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'bracket'>('overview');
  const [isRegistering, setIsRegistering] = useState(false);
  const [optimisticRegistered, setOptimisticRegistered] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      if (res.data.success) {
        setTournament(res.data.data.tournament);
        setParticipants(res.data.data.participants);
        setMatches(res.data.data.matches);
        
        // Reset optimistic state if actual state arrives
        const myRecord = res.data.data.participants.find((p: any) => p.userId._id === user?._id);
        if (myRecord) setOptimisticRegistered(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
      
      const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socket.on(`tournament_${id}`, (event: any) => {
        if (event.type === 'MATCH_COMPLETED' || event.type === 'TOURNAMENT_UPDATED' || event.type === 'ROUND_STARTED' || event.type === 'TOURNAMENT_COMPLETED') {
          fetchData();
        }
      });

      return () => {
        socket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleJoin = async () => {
    if (isRegistering) return;
    const confirm = window.confirm(`Are you sure you want to register for ${tournament.title}?`);
    if (!confirm) return;

    setIsRegistering(true);
    setOptimisticRegistered(true); // Optimistic UI

    try {
      await api.post(`/tournaments/${id}/join`);
      toast.success('Registration successful!');
      fetchData();
    } catch (error: any) {
      setOptimisticRegistered(false); // Revert on failure
      toast.error(error.response?.data?.message || 'Failed to join');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post(`/tournaments/${id}/check-in`);
      toast.success('Checked in successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const myParticipantRecord = participants.find(p => p.userId._id === user?._id);
  const isActuallyRegistered = !!myParticipantRecord || optimisticRegistered;
  
  const getActiveBattleId = () => {
    if (!user || tournament?.status !== 'IN_PROGRESS') return null;
    const activeMatch = matches.find(m => 
      (!m.winner) && (m.player1?._id === user._id || m.player2?._id === user._id)
    );
    return activeMatch?.battleId;
  };

  const myBattleId = getActiveBattleId();

  const getBracketMatches = () => {
    if (matches.length === 0) return [];
    return matches.map((m) => {
      const nextMatchId = m.nextMatchId || null;
      return {
        id: m._id,
        name: `Round ${m.round} - Match ${m.matchIndex + 1}`,
        nextMatchId: nextMatchId,
        tournamentRoundText: `${m.round}`,
        startTime: '',
        state: m.winner ? 'DONE' : (m.player1 && m.player2 ? 'PLAYING' : 'SCHEDULED'),
        participants: [
          {
            id: m.player1?._id || 'TBD1',
            resultText: m.winner?._id === m.player1?._id ? 'WON' : (m.winner ? 'LOST' : null),
            isWinner: m.winner?._id === m.player1?._id,
            status: null,
            name: m.player1?.username || 'TBD'
          },
          {
            id: m.player2?._id || 'TBD2',
            resultText: m.winner?._id === m.player2?._id ? 'WON' : (m.winner ? 'LOST' : null),
            isWinner: m.winner?._id === m.player2?._id,
            status: null,
            name: m.player2?.username || 'TBD'
          }
        ]
      };
    });
  };

  const bracketData = getBracketMatches();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tournament) {
    return <div className="min-h-screen pt-24 px-4 text-center text-error">Tournament not found</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-[1280px] mx-auto">
      <div className="bg-surface-container border border-surface-variant rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
        {tournament.status === 'IN_PROGRESS' && (
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] pointer-events-none rounded-full"></div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-xs font-label-caps uppercase tracking-widest rounded font-bold ${
                tournament.status === 'REGISTRATION' ? 'bg-primary/10 text-primary border border-primary/30' :
                tournament.status === 'IN_PROGRESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                'bg-surface-variant/50 text-on-surface-variant border border-surface-variant'
              }`}>
                {tournament.status.replace('_', ' ')}
              </span>
              <span className="text-xs font-label-caps uppercase tracking-widest text-primary font-bold">
                {tournament.difficulty}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline-lg">{tournament.title}</h1>
            <p className="text-on-surface-variant mt-4 max-w-2xl font-body-md">{tournament.description}</p>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto min-w-[240px]">
            {tournament.status === 'REGISTRATION' && !isActuallyRegistered && tournament.currentParticipantsCount < tournament.maxParticipants && (
              <button 
                onClick={handleJoin} 
                disabled={isRegistering}
                className={`w-full px-8 py-4 rounded font-label-caps text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(255,193,116,0.2)] transition-all ${
                  isRegistering ? 'bg-primary/50 text-on-primary/50 cursor-wait' : 'bg-primary text-on-primary hover:opacity-90 hover:scale-105'
                }`}
              >
                {isRegistering ? 'Registering...' : 'Register Now'}
              </button>
            )}

            {tournament.status === 'REGISTRATION' && isActuallyRegistered && (
              <button disabled className="w-full px-8 py-4 bg-surface-container-low border border-primary text-primary rounded font-label-caps text-xs uppercase tracking-widest font-bold cursor-default">
                Registered
              </button>
            )}

            {tournament.status === 'REGISTRATION' && tournament.currentParticipantsCount >= tournament.maxParticipants && !isActuallyRegistered && (
              <button disabled className="w-full px-8 py-4 bg-surface-container-low border border-surface-variant text-on-surface-variant rounded font-label-caps text-xs uppercase tracking-widest font-bold cursor-not-allowed">
                Tournament Full
              </button>
            )}

            {tournament.status === 'CHECK_IN' && isActuallyRegistered && myParticipantRecord?.status === 'REGISTERED' && (
              <button onClick={handleCheckIn} className="w-full px-8 py-4 bg-amber-500 text-black rounded font-label-caps text-xs uppercase tracking-widest font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 animate-pulse">
                Check In Now
              </button>
            )}

            {myBattleId && (
              <button onClick={() => router.push(`/battle/${myBattleId}`)} className="w-full px-8 py-4 bg-emerald-500 text-black rounded font-label-caps text-xs uppercase tracking-widest font-bold hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
                Enter Match
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-surface-variant relative z-10">
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider mb-1">Participants</p>
            <p className="font-code-sm text-2xl font-bold">{tournament.currentParticipantsCount + (optimisticRegistered && !myParticipantRecord ? 1 : 0)} / {tournament.maxParticipants}</p>
          </div>
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider mb-1">Format</p>
            <p className="font-code-sm text-2xl font-bold">Single Elim</p>
          </div>
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider mb-1">Match Time</p>
            <p className="font-code-sm text-2xl font-bold">{tournament.battleDuration}m</p>
          </div>
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider mb-1">Prize Pool</p>
            <p className="font-code-sm text-2xl font-bold text-amber-500">{tournament.prizePool || 'Glory'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-surface-variant pb-px">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-bold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('participants')}
          className={`px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-bold transition-colors border-b-2 ${activeTab === 'participants' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Participants ({participants.length})
        </button>
        {(tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED') && (
          <button 
            onClick={() => setActiveTab('bracket')}
            className={`px-6 py-3 font-label-caps text-xs tracking-widest uppercase font-bold transition-colors border-b-2 ${activeTab === 'bracket' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
          >
            Bracket
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-surface-container border border-surface-variant p-6 rounded-xl">
              <h3 className="font-headline-lg text-xl mb-4 font-bold">Tournament Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-on-surface-variant font-body-md">
                <li>Players must check-in 15 minutes before start time.</li>
                <li>Single elimination format.</li>
                <li>Match duration is strictly enforced.</li>
                <li>Plagiarism or cheating will result in a permanent ban.</li>
              </ul>
            </div>
            <div className="bg-surface-container border border-surface-variant p-6 rounded-xl">
              <h3 className="font-headline-lg text-xl mb-4 font-bold">Schedule</h3>
              <ul className="space-y-4 text-on-surface-variant font-body-md">
                <li className="flex justify-between items-center pb-2 border-b border-surface-variant/50">
                  <span>Registration Closes</span>
                  <span className="font-code-sm font-bold text-on-surface">TBA</span>
                </li>
                <li className="flex justify-between items-center pb-2 border-b border-surface-variant/50">
                  <span>Check-In Opens</span>
                  <span className="font-code-sm font-bold text-on-surface">TBA</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Tournament Starts</span>
                  <span className="font-code-sm font-bold text-primary">
                    {new Date(tournament.startTime).toLocaleString()}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {participants.map((p) => (
              <div key={p._id} className="flex items-center gap-3 bg-surface-container border border-surface-variant p-4 rounded-xl hover:bg-surface-container-high transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                  {p.userId.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-on-surface">{p.userId.username}</p>
                  <p className="text-xs font-code-sm text-primary">{p.userId.rating || 1000} ELO</p>
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <div className="col-span-full py-12 text-center bg-surface-container border border-surface-variant rounded-xl">
                <span className="material-symbols-outlined text-[48px] text-surface-variant mb-4">group</span>
                <p className="text-on-surface-variant font-body-md">No participants registered yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bracket' && (tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED') && (
          <div className="bg-surface-container border border-surface-variant rounded-xl p-8 overflow-x-auto relative">
            {bracketData.length > 0 ? (
              <div className="flex justify-center" style={{ minWidth: '800px' }}>
                <SingleEliminationBracket
                  matches={bracketData}
                  matchComponent={Match}
                  svgWrapper={({ children, ...props }: any) => (
                    <SVGViewer width={800} height={500} {...props}>
                      {children}
                    </SVGViewer>
                  )}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-on-surface-variant">Generating bracket...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
