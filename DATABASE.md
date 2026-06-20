# MongoDB Schema

## users

{
_id,
name,
email,
avatar,
rating,
rank,
wins,
losses,
createdAt
}

---

## battles

{
_id,
battleType,
status,
problemId,
startTime,
endTime,
winnerId,
players:[]
}

---

## battle_events

{
_id,
battleId,
eventType,
payload,
timestamp
}

---

## submissions

{
_id,
battleId,
userId,
language,
code,
verdict,
executionTime,
createdAt
}

---

## replays

{
_id,
battleId,
events:[]
}

---

## ai_reviews

{
_id,
battleId,
userId,
review,
strengths,
weaknesses,
suggestions
}

---

## tournaments

{
_id,
name,
status,
participants,
winner
}

---

## problems

{
_id,
title,
difficulty,
tags,
description,
constraints,
examples
}
