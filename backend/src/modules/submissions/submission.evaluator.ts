import { Submission } from './submission.model.js';
import { ReplayService } from '../replays/replay.service.js';
import { Battle } from '../battles/battle.model.js';
import { getIO } from '../websockets/socket.service.js';
import { SocketEvents } from '../websockets/events.js';
import { BattleGatewayService } from '../websockets/battle.gateway.js';
import { SubmissionCacheService } from '../../services/redis/SubmissionCacheService.js';
import { BattleCacheService } from '../../services/redis/BattleCacheService.js';
import { LeaderboardService } from '../../services/redis/LeaderboardService.js';
import { RatingService } from '../../services/ranking/RatingService.js';
import { TournamentEngine } from '../tournaments/tournament.engine.js';
import { NotificationService } from '../../services/notifications/NotificationService.js';

export const evaluateSubmissionResult = async (submissionId: string, mappedResults: any[]) => {
  const submission = await Submission.findById(submissionId).populate('user');
  if (!submission) return;

  // Idempotency check: if already evaluated, ignore duplicate webhooks/polls
  if (submission.status !== 'PENDING') return;

  let finalStatus = 'ACCEPTED';
  let passedTests = 0;
  let totalExecutionTime = 0;
  let maxMemory = 0;
  let verdictReason = '';
  let compileOutput = '';

  if (mappedResults.length === 0) {
    finalStatus = 'RUNTIME_ERROR';
    verdictReason = 'Execution timed out or backend failed';
  } else {
    for (const res of mappedResults) {
      if (res.compile_output) compileOutput = Buffer.from(res.compile_output, 'base64').toString('utf-8');
      
      const time = parseFloat(res.time || '0');
      totalExecutionTime += time;
      maxMemory = Math.max(maxMemory, res.memory || 0);

      // 3 is Accepted in our mapped statuses
      if (res.status.id === 3) {
        passedTests++;
      } else {
        // Find the first failing test case and use its status
        if (finalStatus === 'ACCEPTED') {
          if (res.status.id === 4) finalStatus = 'WRONG_ANSWER';
          else if (res.status.id === 5) finalStatus = 'TIME_LIMIT_EXCEEDED';
          else if (res.status.id === 6) finalStatus = 'COMPILATION_ERROR';
          else finalStatus = 'RUNTIME_ERROR';
          
          verdictReason = res.status.description || 'Failed';
        }
      }
    }
  }

  submission.status = finalStatus as any;
  submission.passedTests = passedTests;
  submission.totalTests = mappedResults.length > 0 ? mappedResults.length : (submission.totalTests || 0);
  submission.executionTime = totalExecutionTime;
  submission.memory = maxMemory;
  submission.verdictReason = verdictReason;
  if (compileOutput) submission.compileOutput = compileOutput;
  
  // Storing stdout and stderr of the first failed test, or the last test if all passed
  const lastRes = mappedResults.find(r => r.status.id !== 3) || mappedResults[mappedResults.length - 1];
  if (lastRes) {
      if (lastRes.stdout) submission.stdout = Buffer.from(lastRes.stdout, 'base64').toString('utf-8');
      // Piston's stderr was merged into compile_output or stdout handling in our mapping,
      // but let's keep it safe.
  }

  await submission.save();

  // Update Redis cache
  await SubmissionCacheService.updateStatus(submission._id.toString(), finalStatus, finalStatus === 'ACCEPTED');

  // 1. Create Event
  await ReplayService.logEvent(submission.battle.toString(), finalStatus === 'ACCEPTED' ? 'SubmissionAccepted' : finalStatus, { 
    userId: submission.user._id, 
    submissionId: submission._id,
    language: submission.language,
    executionTime: totalExecutionTime,
    memory: maxMemory,
    passedTests,
    totalTests: submission.totalTests
  });

  const user = submission.user as any;
  const battle = await Battle.findById(submission.battle);
  
  if (!battle) return;

  const io = getIO();

  // 2. Emit Socket Events

  // Full payload for the submitting user (Private)
  const fullPayload = {
    submissionId: submission._id.toString(),
    battleCode: battle.battleCode,
    userId: user._id.toString(),
    username: user.username,
    verdict: finalStatus,
    executionTime: submission.executionTime,
    memory: submission.memory,
    compileOutput: submission.compileOutput,
    verdictReason: submission.verdictReason,
    createdAt: (submission.submittedAt || new Date()).toISOString()
  };

  io?.to(`user_${user._id.toString()}`).emit(SocketEvents.SUBMISSION_VERDICT, fullPayload);

  // Stripped payload for opponents (Public)
  const publicPayload = {
    submissionId: submission._id.toString(),
    battleCode: battle.battleCode,
    userId: user._id.toString(),
    username: user.username,
    verdict: finalStatus,
    createdAt: (submission.submittedAt || new Date()).toISOString()
  };

  // Emit to everyone in the battle, but since the user gets the private one, they might receive both.
  // The frontend can handle this by merging or overriding if it's their own submission.
  // Actually, let's just emit the public one to the battle room.
  io?.to(`battle_${battle.battleCode}`).emit(SocketEvents.SUBMISSION_VERDICT, publicPayload);

  // Emit to global feed if it's ACCEPTED
  if (finalStatus === 'ACCEPTED') {
    try {
      BattleGatewayService.broadcastGlobalFeed(io as any, {
        event: 'SUBMISSION',
        user: user.username,
        battleCode: battle.battleCode,
        time: 'Just now'
      });
    } catch (e) {
      console.error('Failed to emit to global feed', e);
    }
  }

  // 3. Evaluate Battle Win Condition
  if (battle.status === 'IN_PROGRESS' && finalStatus === 'ACCEPTED') {
    // Check if winner already exists (Atomic constraint in real logic, here we check the field)
    if (!battle.winner) {
      // Find if user is participant
      const allMembers = battle.teams.flatMap((t: any) => t.members.map((id: any) => id.toString()));
      if (allMembers.includes(user._id.toString())) {
        
        // Update Battle atomically
        const updatedBattle = await Battle.findOneAndUpdate(
          { _id: battle._id, status: 'IN_PROGRESS', winner: { $exists: false } },
          { 
            $set: { 
              winner: user._id, 
              status: 'COMPLETED',
              endTime: new Date(),
              'result.winReason': 'FIRST_ACCEPTED' 
            }
          },
          { new: true }
        );

        if (updatedBattle) {
          // Clean up cache
          await BattleCacheService.deleteBattle(battle.battleCode);

          // Apply Rating Engine Math
          const participantIds = battle.teams.flatMap((t: any) => t.members.map((id: any) => id.toString()));
          const ratingDeltas = await RatingService.updateBattleRatings(battle._id.toString(), user._id.toString(), participantIds, false);

          // Player Won Event
          await ReplayService.logEvent(battle._id.toString(), 'PlayerWon', { userId: user._id });

          // Battle Completed Event
          await ReplayService.logEvent(battle._id.toString(), 'BattleCompleted', { reason: 'First Accepted' });
          await ReplayService.createSummary(
            battle._id.toString(),
            user._id.toString(),
            participantIds,
            battle.startTime || new Date(),
            new Date(),
            'COMPLETED',
            ratingDeltas
          );

          // Advance tournament if applicable
          if (updatedBattle.battleType === 'TOURNAMENT') {
            await TournamentEngine.advanceWinner(battle._id.toString(), user._id.toString()).catch(err => {
              console.error("Tournament Engine Error:", err);
            });
          }

          // Emit Socket Events
          io?.to(`battle_${battle.battleCode}`).emit(SocketEvents.WINNER_DECLARED, {
            userId: user._id.toString(),
            username: user.username
          });
          io?.to(`battle_${battle.battleCode}`).emit(SocketEvents.BATTLE_COMPLETED, {
            battleCode: battle.battleCode
          });

          // Emit BATTLE_ENDED to global feed
          try {
            BattleGatewayService.broadcastGlobalFeed(io as any, {
              event: 'BATTLE_ENDED',
              winner: user.username,
              battleCode: battle.battleCode,
              time: 'Just now'
            });
          } catch(e) {}

          // Send notifications
          participantIds.forEach(pId => {
            if (pId === user._id.toString()) {
              NotificationService.send(pId, {
                type: 'BATTLE_WON',
                title: 'Victory!',
                message: 'You have won the battle by solving the problem first.',
                data: { battleCode: battle.battleCode, replayId: battle.battleCode }
              }).catch(console.error);
            } else {
              NotificationService.send(pId, {
                type: 'BATTLE_LOST',
                title: 'Defeat',
                message: `${user.username} solved the problem before you.`,
                data: { battleCode: battle.battleCode, replayId: battle.battleCode }
              }).catch(console.error);
            }
          });
        }
      }
    }
  }
};
