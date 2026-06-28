import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../types/socket';
import { BattleStatePayload, BattleStartedPayload, UserJoinedPayload, UserLeftPayload, BattleUpdatedPayload, SubmissionPendingPayload, SubmissionEvaluatedPayload, SubmissionVerdictPayload, WinnerDeclaredPayload, BattleCompletedPayload } from '../types/socket';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export const useBattleSocket = (battleCode: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [battle, setBattle] = useState<any>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(`battleFeed:${battleCode}`);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`battleFeed:${battleCode}`, JSON.stringify(submissionHistory));
    }
  }, [submissionHistory, battleCode]);

  const [winner, setWinner] = useState<WinnerDeclaredPayload | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  const fetchBattle = useCallback(async () => {
    try {
      const res = await api.get(`/battles/${battleCode}`);
      if (res.data.success) {
        const fetchedBattle = res.data.data.battle;
        setBattle(fetchedBattle);
        
        // Fetch submission history to sync battle field
        if (fetchedBattle?._id) {
          api.get(`/submissions/${fetchedBattle._id}`).then(subRes => {
            if (subRes.data.success) {
              const dbSubs = subRes.data.data.submissions.map((s: any) => ({
                 submissionId: s._id,
                 userId: s.user?._id || s.user,
                 username: s.user?.username || 'User',
                 verdict: s.status !== 'PENDING' ? s.status : undefined,
                 status: s.status === 'PENDING' ? 'PENDING' : undefined,
                 timestamp: new Date(s.submittedAt || s.createdAt).getTime()
              })).reverse();
              
              setSubmissionHistory(prev => {
                 const map = new Map();
                 dbSubs.forEach((s: any) => map.set(s.submissionId, s));
                 prev.forEach((p: any) => {
                   if (p.submissionId) {
                      const existing = map.get(p.submissionId);
                      if (!existing || (p.verdict && !existing.verdict)) {
                        map.set(p.submissionId, { ...existing, ...p });
                      }
                   } else {
                      // fallback for events without submissionId
                      map.set(Math.random().toString(), p);
                   }
                 });
                 return Array.from(map.values()).sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
              });
            }
          }).catch(() => {});
        }
      }
    } catch (error) {
      toast.error('Battle not found');
    }
  }, [battleCode]);

  useEffect(() => {
    if (!battleCode) return;

    fetchBattle();

    const socketUrlStr = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    // We MUST extract the origin. If NEXT_PUBLIC_BACKEND_URL has '/api', Socket.IO interprets it as a namespace.
    // The backend does not have an '/api' namespace, causing the 'Invalid namespace' error.
    let socketOrigin = socketUrlStr;
    try {
      socketOrigin = new URL(socketUrlStr).origin;
    } catch (e) {}
    
    const socket = io(socketOrigin, {
      withCredentials: true
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit(SocketEvents.JOIN_ROOM, { battleCode });
      
      // Start heartbeat
      const interval = setInterval(() => {
        socket.emit('presence_heartbeat');
      }, 15000); // 15 seconds
      
      (socket as any).heartbeatInterval = interval;
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      if ((socket as any).heartbeatInterval) {
        clearInterval((socket as any).heartbeatInterval);
      }
    });

    socket.on(SocketEvents.BATTLE_STATE, (payload: BattleStatePayload) => {
      setParticipants(payload.participants);
      setBattle((prev: any) => prev ? { ...prev, status: payload.status, startTime: payload.startTime ? new Date(payload.startTime) : undefined } : null);
    });

    socket.on(SocketEvents.USER_JOINED, (payload: UserJoinedPayload) => {
      setParticipants((prev) => Array.from(new Set([...prev, payload.userId])));
      fetchBattle(); // Refetch to get updated teams
    });

    socket.on(SocketEvents.USER_LEFT, (payload: UserLeftPayload) => {
      setParticipants((prev) => prev.filter(id => id !== payload.userId));
      fetchBattle();
    });

    socket.on(SocketEvents.BATTLE_STARTED, (payload: BattleStartedPayload) => {
      setBattle((prev: any) => {
        if (!prev) return prev;
        return { ...prev, status: 'IN_PROGRESS', startTime: new Date(payload.startTime), durationMinutes: prev.durationMinutes }; // end time is calculated
      });
      toast.success('Battle has started!');
    });

    socket.on(SocketEvents.BATTLE_UPDATED, (payload: BattleUpdatedPayload) => {
      toast.info(payload.message);
      fetchBattle();
    });

    socket.on(SocketEvents.BATTLE_CANCELLED, (payload: any) => {
      setBattle((prev: any) => {
        if (!prev) return prev;
        return { ...prev, status: 'CANCELLED' };
      });
      toast.error(payload.reason || 'Battle was cancelled by host');
    });

    socket.on(SocketEvents.SUBMISSION_PENDING, (payload: SubmissionPendingPayload) => {
      setSubmissionHistory(prev => [...prev, { ...payload, timestamp: Date.now() }]);
    });

    socket.on(SocketEvents.SUBMISSION_EVALUATED, (payload: SubmissionEvaluatedPayload) => {
      setSubmissionHistory(prev => {
        const filtered = prev.filter(s => (s as any).submissionId !== payload.submissionId);
        return [...filtered, { ...payload, timestamp: Date.now() }];
      });
    });

    socket.on(SocketEvents.SUBMISSION_VERDICT, (payload: SubmissionVerdictPayload) => {
      setSubmissionHistory(prev => {
        const filtered = prev.filter(s => (s as any).submissionId !== payload.submissionId);
        return [...filtered, { ...payload, timestamp: Date.now() }];
      });
    });

    socket.on(SocketEvents.WINNER_DECLARED, (payload: WinnerDeclaredPayload) => {
      setWinner(payload);
    });

    socket.on(SocketEvents.BATTLE_COMPLETED, (payload: BattleCompletedPayload) => {
      setBattle((prev: any) => prev ? { ...prev, status: 'COMPLETED' } : null);
    });

    socket.on(SocketEvents.ERROR, (payload: any) => {
      toast.error(payload.message || 'Socket error occurred');
    });

    return () => {
      socket.disconnect();
    };
  }, [battleCode, fetchBattle]);

  const joinRoom = useCallback(async () => {
    try {
      const res = await api.post(`/battles/${battleCode}/join`);
      if (res.data.success) {
        toast.success('Successfully joined the battle!');
        fetchBattle();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join');
    }
  }, [battleCode, fetchBattle]);

  return {
    isConnected,
    battle,
    participants,
    submissionHistory,
    winner,
    joinRoom
  };
};
