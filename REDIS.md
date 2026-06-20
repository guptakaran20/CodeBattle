# Redis Design

## Matchmaking Queue

queue:global

queue:college

queue:tournament

---

## Active Rooms

room:{roomId}

Example

room:123

{
status,
players,
timeLeft,
problemId
}

---

## Leaderboard

Sorted Set

leaderboard

ZADD leaderboard 1800 karan

---

## Pub/Sub Channels

battle_updates

submission_updates

match_updates

tournament_updates

---

## Redis Streams

battle_events

Example

XADD battle_events

event=SubmissionMade

battleId=123

userId=456

---

## Benefits

Pub/Sub

* Real-time communication

Streams

* Replay generation
* Analytics
* Event sourcing
