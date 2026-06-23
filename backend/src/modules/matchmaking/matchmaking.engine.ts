import { MatchmakingService } from '../../services/redis/MatchmakingService.js';
import type { Difficulty } from '../../services/redis/MatchmakingService.js';
import { Battle } from '../battles/battle.model.js';
import { Problem } from '../problems/problem.model.js';
import { getIO } from '../websockets/socket.service.js';
import { SocketEvents } from '../websockets/events.js';

export class MatchmakingEngine {
  private static intervalId: NodeJS.Timeout | null = null;
  private static readonly TICK_RATE_MS = 3000;
  private static readonly DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

  static start() {
    if (this.intervalId) return;
    console.log('[Matchmaking Engine] Started');
    this.intervalId = setInterval(() => this.processQueues(), this.TICK_RATE_MS);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Matchmaking Engine] Stopped');
    }
  }

  private static async processQueues() {
    for (const diff of this.DIFFICULTIES) {
      await this.processQueue(diff);
    }
  }

  private static async processQueue(difficulty: Difficulty) {
    const members = await MatchmakingService.getQueueMembers(difficulty);
    if (members.length < 2) return; // Not enough players to match

    // Track matched players in this cycle to avoid double matching
    const matched = new Set<string>();
    const io = getIO();

    for (const userId of members) {
      if (matched.has(userId)) continue;

      const state = await MatchmakingService.getPlayerState(userId);
      if (!state) continue; // Player left queue

      const radius = MatchmakingService.getDynamicSearchRadius(state.joinedAt);
      
      const potentialOpponents = await MatchmakingService.findOpponentsInRange(
        difficulty,
        state.elo,
        radius,
        userId
      );

      for (const oppId of potentialOpponents) {
        if (matched.has(oppId)) continue;
        
        const oppState = await MatchmakingService.getPlayerState(oppId);
        if (!oppState) continue;

        // Match found!
        matched.add(userId);
        matched.add(oppId);

        console.log(`[Matchmaking Engine] Found Match! ${userId} vs ${oppId} (Difficulty: ${difficulty})`);

        try {
          // 1. Pick a random problem for this difficulty
          const count = await Problem.countDocuments({ difficulty });
          const random = Math.floor(Math.random() * count);
          const problem = await Problem.findOne({ difficulty }).skip(random);

          if (!problem) {
            console.error('[Matchmaking Engine] No problems found for difficulty:', difficulty);
            break;
          }

          // 2. Remove both from queue
          await MatchmakingService.leaveQueue(userId);
          await MatchmakingService.leaveQueue(oppId);

          // 3. Create Battle
          const battleCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          const battle = await Battle.create({
            battleCode,
            battleType: 'ONE_VS_ONE',
            battleMode: 'COMPETITIVE', // Ranked basically
            problem: problem._id,
            creator: userId, // Technical creator, though engine made it
            status: 'WAITING',
            durationMinutes: 30, // Default duration
            teams: [
              { name: 'Team A', members: [userId], score: 0 },
              { name: 'Team B', members: [oppId], score: 0 }
            ]
          });

          // 4. Emit MATCH_FOUND to both users
          const payload = {
            battleCode: battle.battleCode,
            opponentId: oppId, // Depending on who receives it, they get the other's info.
            difficulty
          };

          // To userId
          io?.to(`user_${userId}`).emit(SocketEvents.MATCH_FOUND, { ...payload, opponentId: oppId });
          // To oppId
          io?.to(`user_${oppId}`).emit(SocketEvents.MATCH_FOUND, { ...payload, opponentId: userId });

        } catch (error) {
          console.error('[Matchmaking Engine] Error creating match:', error);
          // If creation fails, we should technically re-queue them, but for MVP it's okay to drop or leave.
        }

        break; // Stop looking for opponents for this userId
      }
    }

    // Emit queue status to remaining unmatched users
    for (const userId of members) {
      if (!matched.has(userId)) {
        const state = await MatchmakingService.getPlayerState(userId);
        if (state) {
          const waitTimeSec = Math.floor((Date.now() - state.joinedAt) / 1000);
          const eloRange = MatchmakingService.getDynamicSearchRadius(state.joinedAt);
          
          io?.to(`user_${userId}`).emit(SocketEvents.QUEUE_STATUS, {
            queueTime: waitTimeSec,
            eloRange: eloRange
          });
        }
      }
    }
  }
}
