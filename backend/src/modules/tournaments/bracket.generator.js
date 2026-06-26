import { Types } from 'mongoose';
import { TournamentMatch } from './tournamentMatch.model.js';
import { TournamentParticipant } from './tournamentParticipant.model.js';
import { User } from '../users/user.model.js';
export class BracketGenerator {
    /**
     * Generates a single-elimination tournament bracket using standard sports seeding.
     * Participants are sorted by rating (highest = #1 seed).
     *
     * @param tournamentId The ID of the tournament
     * @param maxParticipants Expected number of participants (must be a power of 2)
     */
    static async generateBracket(tournamentId, maxParticipants) {
        // 1. Fetch checked-in participants
        const participants = await TournamentParticipant.find({
            tournamentId,
            status: 'CHECKED_IN'
        });
        if (participants.length !== maxParticipants) {
            throw new Error(`Cannot generate bracket: Expected ${maxParticipants} participants, but got ${participants.length}`);
        }
        // 2. Fetch users to get ratings
        const userIds = participants.map(p => p.userId);
        const users = await User.find({ _id: { $in: userIds } });
        // 3. Sort users by rating (highest first) to determine seeds
        const seededUsers = users.sort((a, b) => (b.rating || 1000) - (a.rating || 1000));
        // 4. Generate seeding order (e.g. for 8: [1,8,4,5,2,7,3,6])
        let order = [1, 2];
        while (order.length < maxParticipants) {
            const nextLength = order.length * 2;
            const nextOrder = [];
            for (const pos of order) {
                nextOrder.push(pos);
                nextOrder.push(nextLength - pos + 1);
            }
            order = nextOrder;
        }
        // Convert 1-based order to 0-based index and map to user ObjectIds
        const orderedParticipants = order.map(seed => seededUsers[seed - 1]._id);
        // 5. Build Bracket Tree Structure
        const totalRounds = Math.log2(maxParticipants);
        let currentRoundNodes = [];
        // First round (Round 1)
        for (let i = 0; i < maxParticipants; i += 2) {
            const match = new TournamentMatch({
                tournamentId,
                round: 1,
                matchIndex: i / 2,
                player1: orderedParticipants[i],
                player2: orderedParticipants[i + 1]
            });
            currentRoundNodes.push(match);
        }
        // Save round 1 nodes
        await TournamentMatch.insertMany(currentRoundNodes);
        // Build subsequent rounds
        let previousRoundNodes = currentRoundNodes;
        for (let r = 2; r <= totalRounds; r++) {
            currentRoundNodes = [];
            const matchesInRound = previousRoundNodes.length / 2;
            for (let i = 0; i < matchesInRound; i++) {
                const match = new TournamentMatch({
                    tournamentId,
                    round: r,
                    matchIndex: i
                });
                currentRoundNodes.push(match);
            }
            // Save current round nodes so they get ObjectIds
            const savedNodes = await TournamentMatch.insertMany(currentRoundNodes);
            // Link previous round nodes to their parents (nextMatchId)
            const updatePromises = [];
            for (let i = 0; i < previousRoundNodes.length; i++) {
                const parentMatch = savedNodes[Math.floor(i / 2)];
                const prevMatchId = previousRoundNodes[i]._id;
                updatePromises.push(TournamentMatch.findByIdAndUpdate(prevMatchId, {
                    $set: { nextMatchId: parentMatch._id }
                }));
            }
            await Promise.all(updatePromises);
            previousRoundNodes = savedNodes;
        }
        return true;
    }
}
//# sourceMappingURL=bracket.generator.js.map