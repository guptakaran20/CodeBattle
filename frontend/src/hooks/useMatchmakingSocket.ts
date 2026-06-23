import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketEvents, QueueStatusPayload, MatchFoundPayload, ChallengeReceivedPayload, ChallengeAcceptedPayload } from '../types/socket';
import { toast } from 'sonner';

export const useMatchmakingSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [queueState, setQueueState] = useState<{ isQueued: boolean; difficulty?: string }>({ isQueued: false });
  const [queueStatus, setQueueStatus] = useState<QueueStatusPayload | null>(null);
  const [matchFound, setMatchFound] = useState<MatchFoundPayload | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<ChallengeReceivedPayload | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Heartbeat to keep session alive
      const interval = setInterval(() => {
        socket.emit('presence_heartbeat');
      }, 15000);
      (socket as any).heartbeatInterval = interval;
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      if ((socket as any).heartbeatInterval) {
        clearInterval((socket as any).heartbeatInterval);
      }
    });

    socket.on(SocketEvents.QUEUE_JOINED, (payload: any) => {
      setQueueState({ isQueued: true, difficulty: payload.difficulty });
      setQueueStatus({ queueTime: 0, eloRange: 100 });
    });

    socket.on(SocketEvents.QUEUE_LEFT, () => {
      setQueueState({ isQueued: false });
      setQueueStatus(null);
    });

    socket.on(SocketEvents.QUEUE_STATUS, (payload: QueueStatusPayload) => {
      setQueueStatus(payload);
    });

    socket.on(SocketEvents.MATCH_FOUND, (payload: MatchFoundPayload) => {
      setMatchFound(payload);
    });

    socket.on(SocketEvents.CHALLENGE_RECEIVED, (payload: ChallengeReceivedPayload) => {
      setIncomingChallenge(payload);
      toast(`Incoming Challenge from ${payload.senderUsername}!`, {
        action: {
          label: 'Accept',
          onClick: () => {
            // Can be handled directly via API or state
          }
        }
      });
    });

    socket.on(SocketEvents.CHALLENGE_ACCEPTED, (payload: ChallengeAcceptedPayload) => {
      toast.success('Challenge accepted! Creating match...');
      // Note: Full implementation would redirect or wait for MATCH_FOUND if handled securely
    });

    socket.on(SocketEvents.ERROR, (payload: any) => {
      toast.error(payload.message || 'Socket error occurred');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    isConnected,
    queueState,
    queueStatus,
    matchFound,
    incomingChallenge,
    setIncomingChallenge
  };
};
