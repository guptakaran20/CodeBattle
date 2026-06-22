export enum SocketEvents {
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",

  USER_JOINED = "userJoined",
  USER_LEFT = "userLeft",

  BATTLE_STATE = "battleState",
  BATTLE_UPDATED = "battleUpdated",
  BATTLE_STARTED = "battleStarted",
  BATTLE_CANCELLED = "battleCancelled",

  ERROR = "error"
}

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
