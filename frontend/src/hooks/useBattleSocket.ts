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
  const [submissionHistory, setSubmissionHistory] = useState<(SubmissionPendingPayload | SubmissionEvaluatedPayload | SubmissionVerdictPayload)[]>([]);
  const [winner, setWinner] = useState<WinnerDeclaredPayload | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  const fetchBattle = useCallback(async () => {
    try {
      const res = await api.get(`/battles/${battleCode}`);
      if (res.data.success) {
        setBattle(res.data.data.battle);
      }
    } catch (error) {
      toast.error('Battle not found');
    }
  }, [battleCode]);

  useEffect(() => {
    if (!battleCode) return;

    fetchBattle();

    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
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
      setSubmissionHistory(prev => [...prev, payload]);
    });

    socket.on(SocketEvents.SUBMISSION_EVALUATED, (payload: SubmissionEvaluatedPayload) => {
      setSubmissionHistory(prev => {
        const filtered = prev.filter(s => (s as any).submissionId !== payload.submissionId);
        return [...filtered, payload];
      });
    });

    socket.on(SocketEvents.SUBMISSION_VERDICT, (payload: SubmissionVerdictPayload) => {
      setSubmissionHistory(prev => {
        const filtered = prev.filter(s => (s as any).submissionId !== payload.submissionId);
        return [...filtered, payload];
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
