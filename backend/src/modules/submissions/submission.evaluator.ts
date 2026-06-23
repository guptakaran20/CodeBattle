import { Submission } from './submission.model.js';
import { BattleEvent } from '../battles/battleEvent.model.js';
import { Battle } from '../battles/battle.model.js';
import { getIO } from '../websockets/socket.service.js';
import { SocketEvents } from '../websockets/events.js';

export const evaluateSubmissionResult = async (submissionId: string, judge0Results: any[]) => {
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

  if (judge0Results.length === 0) {
    finalStatus = 'RUNTIME_ERROR';
    verdictReason = 'Execution timed out or backend failed';
  } else {
    for (const res of judge0Results) {
      if (res.compile_output) compileOutput = Buffer.from(res.compile_output, 'base64').toString('utf-8');
      
      const time = parseFloat(res.time || '0');
      totalExecutionTime += time;
      maxMemory = Math.max(maxMemory, res.memory || 0);

      // 3 is Accepted in Judge0
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
  submission.totalTests = judge0Results.length > 0 ? judge0Results.length : (submission.totalTests || 0);
  submission.executionTime = totalExecutionTime;
  submission.memory = maxMemory;
  submission.verdictReason = verdictReason;
  if (compileOutput) submission.compileOutput = compileOutput;
  
  // Storing stdout and stderr of the first failed test, or the last test if all passed
  const lastRes = judge0Results.find(r => r.status.id !== 3) || judge0Results[judge0Results.length - 1];
  if (lastRes) {
      if (lastRes.stdout) submission.stdout = Buffer.from(lastRes.stdout, 'base64').toString('utf-8');
      if (lastRes.stderr) submission.stderr = Buffer.from(lastRes.stderr, 'base64').toString('utf-8');
  }

  await submission.save();

  // 1. Create Event
  await BattleEvent.create({
    battleId: submission.battle,
    eventType: 'SubmissionEvaluated',
    payload: { userId: submission.user._id, submissionId: submission._id, status: finalStatus }
  });

  const user = submission.user as any;
  const battle = await Battle.findById(submission.battle);
  
  if (!battle) return;

  const io = getIO();

  // 2. Emit Socket Event
  io?.to(battle.battleCode).emit(SocketEvents.SUBMISSION_VERDICT, {
    userId: user._id.toString(),
    username: user.username,
    status: finalStatus,
    passedTests: submission.passedTests,
    totalTests: submission.totalTests
  });

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
          // Winner Declared Event
          await BattleEvent.create({
            battleId: battle._id,
            eventType: 'WinnerDeclared',
            payload: { userId: user._id }
          });

          // Battle Completed Event
          await BattleEvent.create({
            battleId: battle._id,
            eventType: 'BattleCompleted',
            payload: { battleCode: battle.battleCode }
          });

          // Emit Socket Events
          io?.to(battle.battleCode).emit(SocketEvents.WINNER_DECLARED, {
            userId: user._id.toString(),
            username: user.username
          });
          io?.to(battle.battleCode).emit(SocketEvents.BATTLE_COMPLETED, {
            battleCode: battle.battleCode
          });
        }
      }
    }
  }
};
