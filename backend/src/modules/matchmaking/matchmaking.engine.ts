import { MatchmakingService } from '../../services/redis/MatchmakingService.js';
import type { Difficulty } from '../../services/redis/MatchmakingService.js';
import { Battle } from '../battles/battle.model.js';
import { Problem } from '../problems/problem.model.js';
import { User } from '../users/user.model.js';
import { getIO } from '../websockets/socket.service.js';
import { SocketEvents } from '../websockets/events.js';
import { BattleGatewayService } from '../websockets/battle.gateway.js';
import { NotificationService } from '../../services/notifications/NotificationService.js';

export class MatchmakingEngine {
  private static intervalId: NodeJS.Timeout | null = null;
  private static readonly TICK_RATE_MS = 1000;
  private static readonly DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];

  private static isProcessing = false;

  static start() {
    if (this.intervalId) return;
    console.log('[Matchmaking Engine] Started');
    this.intervalId = setInterval(() => {
      if (!this.isProcessing) {
        this.processQueues();
      }
    }, this.TICK_RATE_MS);
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Matchmaking Engine] Stopped');
    }
  }

  private static async processQueues() {
    this.isProcessing = true;
    try {
      for (const diff of this.DIFFICULTIES) {
        await this.processQueue(diff);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private static async processQueue(difficulty: Difficulty) {
    const members = await MatchmakingService.getQueueMembers(difficulty);
    const io = getIO();

    // Emit queue status to all users before we process matching
    for (const userId of members) {
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

    if (members.length < 2) {
      // Create bot match for testing if waiting more than 5 seconds
      for (const userId of members) {
        const state = await MatchmakingService.getPlayerState(userId);
        if (state) {
          const waitTimeSec = Math.floor((Date.now() - state.joinedAt) / 1000);
          if (waitTimeSec > 5) {
            // Find an opponent (admin or any other user) or just use a dummy id
            const opponentUser = await User.findOne({ _id: { $ne: userId } });
            if (opponentUser) {
              const oppId = opponentUser._id.toString();
              console.log(`[Matchmaking Engine] Found Bot Match! ${userId} vs ${oppId} (Difficulty: ${difficulty})`);
              
              try {
                const count = await Problem.countDocuments({ difficulty });
                const random = Math.floor(Math.random() * count);
                const problem = await Problem.findOne({ difficulty }).skip(random);

                if (problem) {
                  await MatchmakingService.leaveQueue(userId);
                  
                  const battleCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                  const battle = await Battle.create({
                    battleCode,
                    battleType: 'ONE_VS_ONE',
                    battleMode: 'COMPETITIVE',
                    maxParticipants: 2,
                    problem: problem._id,
                    creator: userId,
                    status: 'WAITING',
                    durationMinutes: 30,
                    teams: [
                      { teamId: '1', name: 'Team A', members: [userId], score: 0 },
                      { teamId: '2', name: 'Team B', members: [oppId], score: 0 }
                    ]
                  });

                  io?.to(`user_${userId}`).emit(SocketEvents.MATCH_FOUND, {
                    battleCode: battle.battleCode,
                    opponentId: oppId
                  });

                  NotificationService.send(userId, {
                    type: 'MATCH_FOUND',
                    title: 'Match Found!',
                    message: 'Your competitive programming battle is starting.',
                    data: { battleCode: battle.battleCode }
                  }).catch(console.error);
                  
                  // Emit global feed
                  const creatorUser = await User.findById(userId).select('username');
                  const oppUsername = opponentUser.username;
                  BattleGatewayService.broadcastGlobalFeed(io, {
                    event: 'MATCH_STARTED',
                    battleCode: battle.battleCode,
                    users: [creatorUser?.username || 'Player', oppUsername || 'Bot'],
                    difficulty: difficulty,
                    time: 'Just now'
                  });
                }
              } catch (e) {
                console.error('Error creating bot match:', e);
              }
            }
          }
        }
      }
      return; // Not enough players to match
    }

    // Track matched players in this cycle to avoid double matching
    const matched = new Set<string>();

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
            maxParticipants: 2,
            problem: problem._id,
            creator: userId, // Technical creator, though engine made it
            status: 'WAITING',
            durationMinutes: 30, // Default duration
            teams: [
              { teamId: '1', name: 'Team A', members: [userId], score: 0 },
              { teamId: '2', name: 'Team B', members: [oppId], score: 0 }
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
          NotificationService.send(userId, {
            type: 'MATCH_FOUND',
            title: 'Match Found!',
            message: 'Your competitive programming battle is starting.',
            data: { battleCode: battle.battleCode }
          }).catch(console.error);

          // To oppId
          io?.to(`user_${oppId}`).emit(SocketEvents.MATCH_FOUND, { ...payload, opponentId: userId });
          NotificationService.send(oppId, {
            type: 'MATCH_FOUND',
            title: 'Match Found!',
            message: 'Your competitive programming battle is starting.',
            data: { battleCode: battle.battleCode }
          }).catch(console.error);

          // 5. Emit global feed
          const u1 = await User.findById(userId).select('username');
          const u2 = await User.findById(oppId).select('username');
          BattleGatewayService.broadcastGlobalFeed(io, {
            event: 'MATCH_STARTED',
            battleCode: battle.battleCode,
            users: [u1?.username || 'Player', u2?.username || 'Player'],
            difficulty: difficulty,
            time: 'Just now'
          });

        } catch (error) {
          console.error('[Matchmaking Engine] Error creating match:', error);
          // If creation fails, we should technically re-queue them, but for MVP it's okay to drop or leave.
        }

        break; // Stop looking for opponents for this userId
      }
    }

    }
}
