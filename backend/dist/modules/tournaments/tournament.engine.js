import { Tournament } from './tournament.model.js';
import { TournamentMatch } from './tournamentMatch.model.js';
import { TournamentParticipant } from './tournamentParticipant.model.js';
import { BracketGenerator } from './bracket.generator.js';
import { Battle } from '../battles/battle.model.js';
import { Problem } from '../problems/problem.model.js';
import { getIO } from '../websockets/socket.service.js';
import { nanoid } from 'nanoid';
import { NotificationService } from '../../services/notifications/NotificationService.js';
import { TournamentStatus } from '../../constants/tournament.js';
export class TournamentEngine {
    /**
     * Spawns a battle for a given tournament match node.
     */
    static async spawnBattle(tournament, match) {
        // Pick a random problem for the match based on tournament difficulty
        // (For MVP, just pick any problem matching the difficulty)
        const problems = await Problem.find({ difficulty: tournament.difficulty });
        const problem = problems.length > 0
            ? problems[Math.floor(Math.random() * problems.length)]
            : await Problem.findOne(); // Fallback
        if (!problem)
            throw new Error("No problems available to spawn tournament battle");
        const battleCode = `TRN-${nanoid(8).toUpperCase()}`;
        const battle = new Battle({
            battleCode,
            creator: tournament.createdBy, // Admin or system as creator
            teams: [
                { teamId: 'team-1', members: [match.player1] },
                { teamId: 'team-2', members: [match.player2] }
            ],
            battleType: 'TOURNAMENT',
            battleMode: 'COMPETITIVE',
            maxParticipants: 2,
            problem: problem._id,
            durationMinutes: tournament.battleDuration,
            status: 'WAITING',
            tournamentId: tournament._id,
            tournamentMatchId: match._id
        });
        await battle.save();
        match.battleId = battle._id;
        await match.save();
        return battle;
    }
    /**
     * Starts a tournament, generates the bracket, and spawns the first round.
     */
    static async startTournament(tournamentId) {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament)
            throw new Error("Tournament not found");
        if (tournament.status !== 'CHECK_IN')
            throw new Error("Tournament must be in CHECK_IN phase to start");
        // 1. Generate Bracket
        await BracketGenerator.generateBracket(tournament._id.toString(), tournament.maxParticipants);
        // 2. Spawn Battles for Round 1
        const round1Matches = await TournamentMatch.find({ tournamentId: tournament._id, round: 1 });
        for (const match of round1Matches) {
            if (match.player1 && match.player2) {
                await this.spawnBattle(tournament, match);
            }
        }
        // 3. Update Tournament State
        tournament.status = TournamentStatus.IN_PROGRESS;
        tournament.currentRound = 1;
        tournament.startTime = new Date();
        await tournament.save();
        // Update Participants state
        await TournamentParticipant.updateMany({ tournamentId: tournament._id, status: 'CHECKED_IN' }, { $set: { status: 'ACTIVE' } });
        const activeParticipants = await TournamentParticipant.find({ tournamentId: tournament._id, status: 'ACTIVE' });
        for (const p of activeParticipants) {
            NotificationService.send(p.userId.toString(), {
                type: 'TOURNAMENT_STARTED',
                title: 'Tournament Started',
                message: 'The tournament has begun! Check your bracket for your first match.',
                data: { tournamentId: tournament._id.toString() }
            }).catch(console.error);
        }
        // Broadcast
        const io = getIO();
        if (io) {
            io.emit(`tournament_${tournament._id}`, { type: 'TOURNAMENT_UPDATED', status: 'IN_PROGRESS' });
            io.emit(`tournament_${tournament._id}`, { type: 'ROUND_STARTED', round: 1 });
        }
    }
    /**
     * Handles logic when a tournament battle concludes.
     */
    static async advanceWinner(battleId, winnerId) {
        const battle = await Battle.findById(battleId);
        if (!battle || battle.battleType !== 'TOURNAMENT' || !battle.tournamentMatchId)
            return;
        const match = await TournamentMatch.findById(battle.tournamentMatchId);
        if (!match)
            return;
        // Determine winner (if draw/timeout without winner, randomly pick one or lowest seed. For MVP, pick player1 if null)
        let advancedUserId = winnerId;
        if (!advancedUserId) {
            // In case of timeout draw, just pick player 1 to advance to avoid locking the bracket
            advancedUserId = match.player1?.toString() || null;
        }
        if (!advancedUserId)
            return; // Should not happen
        match.winner = advancedUserId;
        await match.save();
        const loserId = match.player1?.toString() === advancedUserId ? match.player2 : match.player1;
        // Eliminate the loser
        if (loserId) {
            const finalPosition = Math.pow(2, Math.floor(Math.log2(match.round)) + 1); // rough position (e.g. round 1 in 8 player = pos 5-8. We'll refine later)
            await TournamentParticipant.findOneAndUpdate({ tournamentId: match.tournamentId, userId: loserId }, { $set: { status: 'ELIMINATED', finalPosition: finalPosition } });
            NotificationService.send(loserId.toString(), {
                type: 'TOURNAMENT_ELIMINATED',
                title: 'Tournament Eliminated',
                message: 'You have been eliminated from the tournament. Better luck next time!',
                data: { tournamentId: match.tournamentId.toString() }
            }).catch(console.error);
        }
        const io = getIO();
        if (io)
            io.emit(`tournament_${match.tournamentId}`, { type: 'MATCH_COMPLETED', matchId: match._id });
        // If there is a next match, advance the winner
        if (match.nextMatchId) {
            const nextMatch = await TournamentMatch.findById(match.nextMatchId);
            if (nextMatch) {
                // Place in player1 or player2 slot
                if (!nextMatch.player1) {
                    nextMatch.player1 = advancedUserId;
                }
                else if (!nextMatch.player2) {
                    nextMatch.player2 = advancedUserId;
                }
                await nextMatch.save();
                // If both players are now in the next match, spawn the battle automatically
                if (nextMatch.player1 && nextMatch.player2) {
                    const tournament = await Tournament.findById(match.tournamentId);
                    if (tournament) {
                        await this.spawnBattle(tournament, nextMatch);
                        if (io)
                            io.emit(`tournament_${tournament._id}`, { type: 'TOURNAMENT_UPDATED' });
                    }
                }
                else {
                    NotificationService.send(advancedUserId.toString(), {
                        type: 'TOURNAMENT_ADVANCED',
                        title: 'Round Advanced',
                        message: 'You advanced to the next round! Waiting for your opponent...',
                        data: { tournamentId: match.tournamentId.toString() }
                    }).catch(console.error);
                }
            }
        }
        else {
            // No next match = This was the finals. Tournament over.
            const tournament = await Tournament.findById(match.tournamentId);
            if (tournament) {
                tournament.status = TournamentStatus.COMPLETED;
                tournament.winner = advancedUserId;
                await tournament.save();
                // Mark the champion
                await TournamentParticipant.findOneAndUpdate({ tournamentId: match.tournamentId, userId: advancedUserId }, { $set: { status: 'ELIMINATED', finalPosition: 1 } } // ELIMINATED is just terminal state, maybe keeping ACTIVE is better or a new state.
                );
                NotificationService.send(advancedUserId.toString(), {
                    type: 'TOURNAMENT_ADVANCED',
                    title: 'Tournament Won!',
                    message: 'Congratulations! You are the champion of the tournament.',
                    data: { tournamentId: match.tournamentId.toString() }
                }).catch(console.error);
                if (io)
                    io.emit(`tournament_${tournament._id}`, { type: 'TOURNAMENT_COMPLETED', winnerId: advancedUserId });
            }
        }
    }
}
//# sourceMappingURL=tournament.engine.js.map