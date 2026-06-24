import { redis } from '../../config/redis.js';
import { BattleEvent } from './battleEvent.model.js';
import { BattleReplay } from './battleReplay.model.js';

export class ReplayService {
  /**
   * Logs an event to MongoDB (Source of Truth) and optionally pushes to Redis Streams.
   */
  static async logEvent(battleId: string, eventType: string, payload: any = {}) {
    try {
      // 1. Get atomic sequence number for this battle
      const seqKey = `replay:seq:${battleId}`;
      const sequenceNumber = await redis.incr(seqKey);

      // 2. Persist to MongoDB (Source of Truth)
      const event = new BattleEvent({
        battleId,
        sequenceNumber,
        eventType,
        payload
      });
      await event.save();

      // 3. Supplemental: Push to Redis Streams for real-time analytics/spectators
      try {
        await redis.xadd(
          'battle_events',
          '*',
          'battleId', battleId.toString(),
          'sequenceNumber', sequenceNumber.toString(),
          'eventType', eventType,
          'payload', JSON.stringify(payload),
          'timestamp', event.timestamp.toISOString()
        );
      } catch (streamErr) {
        console.error('Failed to write to Redis Stream:', streamErr);
      }

      return event;
    } catch (error) {
      console.error(`Error logging replay event [${eventType}]:`, error);
    }
  }

  /**
   * Creates a lightweight summary snapshot when a battle completes.
   */
  static async createSummary(
    battleId: string,
    winnerId: string | null | undefined,
    participantIds: string[],
    startedAt: Date,
    endedAt: Date,
    finalStatus: string
  ) {
    try {
      const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
      
      // Calculate total submissions based on SubmissionPending events
      const totalSubmissions = await BattleEvent.countDocuments({
        battleId,
        eventType: 'SubmissionPending'
      });
      
      const summary = new BattleReplay({
        battleId,
        winner: winnerId,
        participants: participantIds,
        duration: durationSeconds,
        totalSubmissions,
        startedAt,
        endedAt,
        finalStatus
      });
      await summary.save();
      return summary;
    } catch (error) {
      console.error('Error creating battle replay summary:', error);
    }
  }
}
