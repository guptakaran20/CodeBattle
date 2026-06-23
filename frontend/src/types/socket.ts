export enum SocketEvents {
  JOIN_ROOM = "joinRoom",
  LEAVE_ROOM = "leaveRoom",

  USER_JOINED = "userJoined",
  USER_LEFT = "userLeft",

  BATTLE_STATE = "battleState",
  BATTLE_UPDATED = "battleUpdated",
  BATTLE_STARTED = "battleStarted",
  BATTLE_CANCELLED = "battleCancelled",

  SUBMISSION_PENDING = "submissionPending",
  SUBMISSION_EVALUATED = "submissionEvaluated",
  SUBMISSION_VERDICT = "submissionVerdict",

  WINNER_DECLARED = "winnerDeclared",
  BATTLE_COMPLETED = "battleCompleted",

  QUEUE_JOINED = "queueJoined",
  QUEUE_LEFT = "queueLeft",
  QUEUE_STATUS = "queueStatus",
  MATCH_FOUND = "matchFound",

  CHALLENGE_RECEIVED = "challengeReceived",
  CHALLENGE_ACCEPTED = "challengeAccepted",
  CHALLENGE_DECLINED = "challengeDeclined",

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

export interface SubmissionPendingPayload {
  submissionId: string;
  userId: string;
  username: string;
}

export interface SubmissionEvaluatedPayload {
  submissionId: string;
  userId: string;
  username: string;
  verdict: string;
}

export interface SubmissionVerdictPayload {
  submissionId: string;
  battleCode: string;
  userId: string;
  username: string;
  verdict: string;
  executionTime?: number;
  memory?: number;
  compileOutput?: string;
  verdictReason?: string;
  createdAt: string;
}

export interface WinnerDeclaredPayload {
  userId: string;
  username: string;
}

export interface BattleCompletedPayload {
  battleCode: string;
}

export interface ErrorPayload {
  message: string;
}

export interface QueueStatusPayload {
  queueTime: number;
  eloRange: number;
}

export interface MatchFoundPayload {
  battleCode: string;
  opponentId: string;
  difficulty: string;
}

export interface ChallengeReceivedPayload {
  challengeId: string;
  senderUsername: string;
}

export interface ChallengeAcceptedPayload {
  challengeId: string;
}
