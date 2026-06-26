export var SocketEvents;
(function (SocketEvents) {
    SocketEvents["JOIN_ROOM"] = "joinRoom";
    SocketEvents["LEAVE_ROOM"] = "leaveRoom";
    SocketEvents["USER_JOINED"] = "userJoined";
    SocketEvents["USER_LEFT"] = "userLeft";
    SocketEvents["BATTLE_STATE"] = "battleState";
    SocketEvents["BATTLE_UPDATED"] = "battleUpdated";
    SocketEvents["BATTLE_STARTED"] = "battleStarted";
    SocketEvents["BATTLE_CANCELLED"] = "battleCancelled";
    SocketEvents["SUBMISSION_PENDING"] = "submissionPending";
    SocketEvents["SUBMISSION_EVALUATED"] = "submissionEvaluated";
    SocketEvents["SUBMISSION_VERDICT"] = "submissionVerdict";
    SocketEvents["WINNER_DECLARED"] = "winnerDeclared";
    SocketEvents["GLOBAL_FEED_UPDATE"] = "global_feed_update";
    SocketEvents["BATTLE_COMPLETED"] = "battleCompleted";
    SocketEvents["QUEUE_JOINED"] = "queueJoined";
    SocketEvents["QUEUE_LEFT"] = "queueLeft";
    SocketEvents["QUEUE_STATUS"] = "queueStatus";
    SocketEvents["MATCH_FOUND"] = "matchFound";
    SocketEvents["CHALLENGE_RECEIVED"] = "challengeReceived";
    SocketEvents["CHALLENGE_ACCEPTED"] = "challengeAccepted";
    SocketEvents["CHALLENGE_DECLINED"] = "challengeDeclined";
    SocketEvents["ERROR"] = "error";
})(SocketEvents || (SocketEvents = {}));
//# sourceMappingURL=events.js.map