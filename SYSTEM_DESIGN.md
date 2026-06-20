# System Design

## High Level Architecture

Frontend
↓
API Gateway
↓
Express Backend
↓
MongoDB

Redis

Judge0

OpenAI

Socket.IO

---

## Services

### Auth Service

Responsibilities:

* Login
* JWT
* Session Management

### Matchmaking Service

Responsibilities:

* Queue Users
* Create Rooms
* Match Players

### Battle Service

Responsibilities:

* Battle Lifecycle
* Submission Handling
* Scoring

### Replay Service

Responsibilities:

* Event Storage
* Replay Reconstruction

### AI Service

Responsibilities:

* Reviews
* Interview Questions
* Similar Problems

---

## Scalability

Horizontal Backend Instances

Instance A
Instance B
Instance C

Redis Pub/Sub synchronizes events between instances.

Socket.IO adapter uses Redis.

---

## Event Flow

User Submission
↓
Judge0
↓
Verdict
↓
Redis Pub/Sub
↓
Socket.IO
↓
Players

---

## Event Sourcing Flow

BattleCreated

PlayerJoined

ProblemAssigned

SubmissionMade

Accepted

BattleEnded

All events stored permanently.
