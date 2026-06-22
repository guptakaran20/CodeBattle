import { SocketEvents } from './events.js';

export interface JoinRoomPayload {
  battleCode: string;
}

export interface UserJoinedPayload {
  userId: string;
  username: string;
}

export interface UserLeftPayload {
  userId: string;
}

export interface BattleStatePayload {
  battleCode: string;
  status: string;
  battleType: string;
  battleMode: string;
  creatorId: string;
  participants: string[];
  startTime?: string;
  endTime?: string;
}

export interface BattleUpdatedPayload {
  battleCode: string;
  // This can be expanded to specific fields that updated, but for now we'll just re-sync the whole state or just notify
  message: string;
}

export interface BattleStartedPayload {
  battleCode: string;
  startTime: string;
  endTime: string;
}

export interface BattleCancelledPayload {
  battleCode: string;
  reason: string;
}

export interface ErrorPayload {
  message: string;
}
