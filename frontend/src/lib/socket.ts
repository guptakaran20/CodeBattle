import { io } from 'socket.io-client';

const socketUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export const socket = io(socketUrl, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: true,
});
