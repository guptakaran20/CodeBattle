import type { ClientSession } from 'mongoose';
import { Tournament } from './tournament.model.js';
import type { ITournament } from './tournament.model.js';
import { TournamentParticipant } from './tournamentParticipant.model.js';
import type { ITournamentParticipant } from './tournamentParticipant.model.js';

export class TournamentRepository {
  static async findById(id: string, session?: ClientSession): Promise<ITournament | null> {
    return Tournament.findById(id).session(session || null);
  }

  static async findBySlugOrId(identifier: string, session?: ClientSession): Promise<ITournament | null> {
    // If it's a valid ObjectId, search by ID, else search by slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      return Tournament.findById(identifier).session(session || null);
    }
    return Tournament.findOne({ $or: [{ slug: identifier }, { shortId: identifier }] }).session(session || null);
  }

  static async listTournaments(filters: any, limit: number, skip: number): Promise<ITournament[]> {
    return Tournament.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async findParticipant(tournamentId: string, userId: string, session?: ClientSession): Promise<ITournamentParticipant | null> {
    return TournamentParticipant.findOne({ tournamentId, userId }).session(session || null);
  }

  static async createParticipant(tournamentId: string, userId: string, session?: ClientSession): Promise<ITournamentParticipant> {
    const participant = new TournamentParticipant({
      tournamentId,
      userId,
      status: 'REGISTERED'
    });
    return participant.save(session ? { session } : {});
  }

  static async incrementParticipantCount(tournamentId: string, session?: ClientSession): Promise<ITournament | null> {
    // Uses optimistic concurrency via mongoose versionKey internally if configured, 
    // or just atomic $inc which is inherently safe within a transaction.
    return Tournament.findOneAndUpdate(
      { _id: tournamentId },
      { $inc: { currentParticipantsCount: 1 } },
      session ? { new: true, session } : { new: true }
    );
  }

  static async updateStatus(tournamentId: string, status: string): Promise<ITournament | null> {
    return Tournament.findByIdAndUpdate(tournamentId, { status }, { new: true });
  }
}
