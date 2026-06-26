import { Tournament } from './tournament.model.js';
import { TournamentParticipant } from './tournamentParticipant.model.js';
export class TournamentRepository {
    static async findById(id, session) {
        return Tournament.findById(id).session(session || null);
    }
    static async findBySlugOrId(identifier, session) {
        // If it's a valid ObjectId, search by ID, else search by slug
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            return Tournament.findById(identifier).session(session || null);
        }
        return Tournament.findOne({ $or: [{ slug: identifier }, { shortId: identifier }] }).session(session || null);
    }
    static async listTournaments(filters, limit, skip) {
        return Tournament.find(filters)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
    static async findParticipant(tournamentId, userId, session) {
        return TournamentParticipant.findOne({ tournamentId, userId }).session(session || null);
    }
    static async createParticipant(tournamentId, userId, session) {
        const participant = new TournamentParticipant({
            tournamentId,
            userId,
            status: 'REGISTERED'
        });
        return participant.save(session ? { session } : {});
    }
    static async incrementParticipantCount(tournamentId, session) {
        // Uses optimistic concurrency via mongoose versionKey internally if configured, 
        // or just atomic $inc which is inherently safe within a transaction.
        return Tournament.findOneAndUpdate({ _id: tournamentId }, { $inc: { currentParticipantsCount: 1 } }, session ? { new: true, session } : { new: true });
    }
    static async updateStatus(tournamentId, status) {
        return Tournament.findByIdAndUpdate(tournamentId, { status }, { new: true });
    }
}
//# sourceMappingURL=tournament.repository.js.map