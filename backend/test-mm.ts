import { MatchmakingService } from './src/services/redis/MatchmakingService.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const membersEasy = await MatchmakingService.getQueueMembers('EASY');
  const membersMed = await MatchmakingService.getQueueMembers('MEDIUM');
  const membersHard = await MatchmakingService.getQueueMembers('HARD');
  console.log('EASY:', membersEasy);
  console.log('MEDIUM:', membersMed);
  console.log('HARD:', membersHard);

  if (membersMed.length > 0) {
    const s = await MatchmakingService.getPlayerState(membersMed[0]);
    console.log('State for first medium member:', s);
  }
  process.exit(0);
}

test().catch(console.error);
