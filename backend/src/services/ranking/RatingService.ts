import { User } from '../../modules/users/user.model.js';
import { UserRatingEvent } from '../../modules/leaderboard/userRatingEvent.model.js';
import { LeaderboardService } from '../redis/LeaderboardService.js';
import { Types } from 'mongoose';

export class RatingService {
  private static K_FACTOR = 32;

  static getRankBoundary(rating: number): string {
    if (rating < 1000) return 'Rookie';
    if (rating < 1200) return 'Bronze';
    if (rating < 1400) return 'Silver';
    if (rating < 1600) return 'Gold';
    if (rating < 1800) return 'Platinum';
    if (rating < 2000) return 'Diamond';
    return 'Master';
  }

  static getRankBoundaries() {
    return [
      { name: 'Rookie', min: 0, max: 999 },
      { name: 'Bronze', min: 1000, max: 1199 },
      { name: 'Silver', min: 1200, max: 1399 },
      { name: 'Gold', min: 1400, max: 1599 },
      { name: 'Platinum', min: 1600, max: 1799 },
      { name: 'Diamond', min: 1800, max: 1999 },
      { name: 'Master', min: 2000, max: 99999 }
    ];
  }

  static calculateExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  static async updateBattleRatings(
    battleId: string, 
    winnerId: string | null, 
    participantIds: string[], 
    isTimeout: boolean = false
  ): Promise<any[]> {
    const users = await User.find({ _id: { $in: participantIds } });
    if (users.length === 0) return [];

    const deltas: any[] = [];

    // 1v1 Mode
    if (users.length === 2) {
      const u1 = users[0]!;
      const u2 = users[1]!;
      
      const r1 = u1.rating || 1000;
      const r2 = u2.rating || 1000;

      const e1 = this.calculateExpectedScore(r1, r2);
      const e2 = this.calculateExpectedScore(r2, r1);

      let s1 = 0.5, s2 = 0.5;
      let out1: 'WIN' | 'LOSS' | 'DRAW' | 'TIMEOUT' = isTimeout ? 'TIMEOUT' : 'DRAW';
      let out2: 'WIN' | 'LOSS' | 'DRAW' | 'TIMEOUT' = isTimeout ? 'TIMEOUT' : 'DRAW';

      if (winnerId) {
        if (winnerId.toString() === u1._id.toString()) {
          s1 = 1; s2 = 0;
          out1 = 'WIN'; out2 = 'LOSS';
        } else if (winnerId.toString() === u2._id.toString()) {
          s1 = 0; s2 = 1;
          out1 = 'LOSS'; out2 = 'WIN';
        }
      }

      const d1 = Math.round(this.K_FACTOR * (s1 - e1));
      const d2 = Math.round(this.K_FACTOR * (s2 - e2));

      await this.applyRatingChange(u1, battleId, d1, out1);
      await this.applyRatingChange(u2, battleId, d2, out2);

      deltas.push({ userId: u1._id.toString(), ratingBefore: r1, ratingAfter: u1.rating, delta: d1 });
      deltas.push({ userId: u2._id.toString(), ratingBefore: r2, ratingAfter: u2.rating, delta: d2 });
    } 
    // Free For All (>2 players)
    else if (users.length > 2) {
      const winner = users.find(u => u._id.toString() === winnerId);
      const losers = users.filter(u => u._id.toString() !== winnerId);

      if (winner && !isTimeout) {
        const winnerRating = winner.rating || 1000;
        let totalWinnerDelta = 0;

        for (const loser of losers) {
          const loserRating = loser.rating || 1000;
          const eWin = this.calculateExpectedScore(winnerRating, loserRating);
          const eLos = this.calculateExpectedScore(loserRating, winnerRating);
          
          const dWin = Math.round((this.K_FACTOR * (1 - eWin)) / losers.length);
          const dLos = Math.round(this.K_FACTOR * (0 - eLos));
          
          totalWinnerDelta += dWin;
          await this.applyRatingChange(loser, battleId, dLos, 'LOSS');
          deltas.push({ userId: loser._id.toString(), ratingBefore: loserRating, ratingAfter: loser.rating, delta: dLos });
        }

        await this.applyRatingChange(winner, battleId, totalWinnerDelta, 'WIN');
        deltas.push({ userId: winner._id.toString(), ratingBefore: winnerRating, ratingAfter: winner.rating, delta: totalWinnerDelta });
      } else {
        // Draw/Timeout for everyone
        for (const u of users) {
          await this.applyRatingChange(u, battleId, 0, isTimeout ? 'TIMEOUT' : 'DRAW');
          deltas.push({ userId: u._id.toString(), ratingBefore: u.rating || 1000, ratingAfter: u.rating || 1000, delta: 0 });
        }
      }
    }

    return deltas;
  }

  private static async applyRatingChange(user: any, battleId: string, delta: number, outcome: 'WIN'|'LOSS'|'DRAW'|'TIMEOUT') {
    const oldRating = user.rating || 1000;
    const newRating = Math.max(0, oldRating + delta); 

    user.rating = newRating;
    user.peakRating = Math.max(user.peakRating || 1000, newRating);
    user.rank = this.getRankBoundary(newRating);
    
    if (outcome === 'WIN') user.wins = (user.wins || 0) + 1;
    if (outcome === 'LOSS') user.losses = (user.losses || 0) + 1;
    if (outcome === 'DRAW' || outcome === 'TIMEOUT') user.draws = (user.draws || 0) + 1;
    user.battlesPlayed = (user.battlesPlayed || 0) + 1;

    await user.save();
    
    await UserRatingEvent.create({
      userId: user._id,
      battleId,
      oldRating,
      newRating,
      delta,
      outcome
    });

    await LeaderboardService.updateUserRank(user._id.toString(), newRating);
  }
}
