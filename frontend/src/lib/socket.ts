import { io } from 'socket.io-client';

const socketUrlStr = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

// Extract just the origin to prevent Socket.IO from interpreting paths like '/api' as a namespace
let socketOrigin = socketUrlStr;
try {
  const url = new URL(socketUrlStr);
  socketOrigin = url.origin;
} catch (e) {
  // Fallback to original string if not a valid URL
}

export const socket = io(socketOrigin, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  autoConnect: true,
});
