// import mongoose from 'mongoose';
// import { Battle } from '../modules/battles/battle.model';
// import { User } from '../modules/users/user.model';
export {};
// async function setWinner() {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/codearena');
//     console.log('Connected to MongoDB');
//     const battleCode = 'CA-AFEU-PDM';
//     const username = 'test1';
//     const user = await User.findOne({ username });
//     if (!user) {
//       console.log(`User ${username} not found`);
//       process.exit(1);
//     }
//     const battle = await Battle.findOne({ battleCode });
//     if (!battle) {
//       console.log(`Battle ${battleCode} not found`);
//       process.exit(1);
//     }
//     let winningTeamId;
//     for (const team of battle.teams) {
//       if (team.members.some(m => m.toString() === user._id.toString())) {
//         winningTeamId = team.teamId;
//         break;
//       }
//     }
//     if (!winningTeamId) {
//       console.log(`User ${username} is not in the battle`);
//       process.exit(1);
//     }
//     battle.status = 'COMPLETED';
//     battle.winner = user._id;
//     battle.result = {
//       winningTeamId,
//       winReason: 'MANUAL',
//     };
//     battle.endTime = new Date();
//     await battle.save();
//     console.log(`Battle ${battleCode} marked as WON by ${username} (Team ${winningTeamId})`);
//     process.exit(0);
//   } catch (err) {
//     console.error(err);
//     process.exit(1);
//   }
// }
// setWinner();
//# sourceMappingURL=set-winner.js.map