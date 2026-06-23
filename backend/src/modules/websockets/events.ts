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

  ERROR = "error"
}
