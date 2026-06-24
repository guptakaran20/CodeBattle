'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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
          fetchData(); // Just refetch all data to keep it simple and perfectly in sync
        }
      });

      return () => {
        socket.disconnect();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      if (res.data.success) {
        setTournament(res.data.data.tournament);
        setParticipants(res.data.data.participants);
        setMatches(res.data.data.matches);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/tournaments/${id}/join`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to join');
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post(`/tournaments/${id}/check-in`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const myParticipantRecord = participants.find(p => p.userId._id === user?._id);
  
  // Find my active battle if tournament is IN_PROGRESS
  const getActiveBattleId = () => {
    if (!user || tournament?.status !== 'IN_PROGRESS') return null;
    const activeMatch = matches.find(m => 
      (!m.winner) && (m.player1?._id === user._id || m.player2?._id === user._id)
    );
    return activeMatch?.battleId;
  };

  const myBattleId = getActiveBattleId();

  // Map matches to react-tournament-brackets format
  const getBracketMatches = () => {
    if (matches.length === 0) return [];

    return matches.map((m) => {
      // Find the ID of the "next" match for standard bracket flow
      let nextMatchId = m.nextMatchId || null;
      
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
    return <div className="p-8 text-center">Loading tournament...</div>;
  }

  if (!tournament) {
    return <div className="p-8 text-center text-error">Tournament not found</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="bg-surface-container border border-surface-variant rounded-2xl p-8 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 text-xs font-label-caps uppercase tracking-widest rounded-full font-bold bg-primary/20 text-primary border border-primary/30">
                {tournament.status.replace('_', ' ')}
              </span>
              <span className="text-sm font-code-sm text-on-surface-variant px-2 py-1 bg-surface-variant rounded">
                {tournament.difficulty}
              </span>
            </div>
            <h1 className="text-4xl font-bold font-headline-lg">{tournament.title}</h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl">{tournament.description}</p>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            {tournament.status === 'REGISTRATION' && !myParticipantRecord && (
              <button onClick={handleJoin} className="w-full px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                Join Tournament
              </button>
            )}

            {tournament.status === 'CHECK_IN' && myParticipantRecord?.status === 'REGISTERED' && (
              <button onClick={handleCheckIn} className="w-full px-6 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 animate-pulse">
                Check In Now!
              </button>
            )}

            {myBattleId && (
              <button onClick={() => router.push(`/battle/${myBattleId}`)} className="w-full px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">
                Enter Match
              </button>
            )}

            {myParticipantRecord && (
              <div className="text-center p-3 bg-surface-container-high rounded-xl border border-surface-variant text-sm font-semibold">
                Status: <span className={myParticipantRecord.status === 'ELIMINATED' ? 'text-error' : 'text-primary'}>
                  {myParticipantRecord.status}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-surface-variant">
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider">Participants</p>
            <p className="font-headline-lg text-2xl">{participants.length} / {tournament.maxParticipants}</p>
          </div>
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider">Format</p>
            <p className="font-headline-lg text-2xl">Single Elim</p>
          </div>
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider">Match Time</p>
            <p className="font-headline-lg text-2xl">{tournament.battleDuration}m</p>
          </div>
          <div>
            <p className="text-[10px] font-label-caps uppercase text-on-surface-variant tracking-wider">Prize Pool</p>
            <p className="font-headline-lg text-2xl text-amber-500">{tournament.prizePool || 'Glory'}</p>
          </div>
        </div>
      </div>

      {tournament.status === 'IN_PROGRESS' || tournament.status === 'COMPLETED' ? (
        <div className="bg-surface-container border border-surface-variant rounded-2xl p-6 shadow-lg overflow-x-auto min-h-[500px]">
          <h2 className="text-2xl font-bold font-headline-lg mb-6 text-center">Tournament Bracket</h2>
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
            <p className="text-center text-on-surface-variant">Generating bracket...</p>
          )}
        </div>
      ) : (
        <div className="bg-surface-container border border-surface-variant rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold font-headline-lg mb-6">Registered Participants</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {participants.map((p) => (
              <div key={p._id} className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-surface-variant">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {p.userId.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{p.userId.username}</p>
                  <p className="text-xs text-on-surface-variant">Rating: {p.userId.rating || 1000}</p>
                </div>
              </div>
            ))}
            {participants.length === 0 && (
              <p className="text-on-surface-variant col-span-4 py-8 text-center">No participants registered yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
