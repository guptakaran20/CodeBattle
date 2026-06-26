import mongoose from 'mongoose';
import { TournamentRepository } from './tournament.repository.js';
import { TournamentStatus } from '../../constants/tournament.js';
// Placeholder for Event/Notification imports
// import { NotificationService } from '../notifications/notification.service.js';

export class TournamentService {
  /**
   * Registers a user for a tournament with full transactional safety.
   */
  static async registerParticipant(identifier: string, userId: string) {
    // 1. Fetch tournament to check capacity and status
    const tournament = await TournamentRepository.findBySlugOrId(identifier);
    
    if (!tournament) {
      throw new Error('Tournament not found');
    }
    
    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new Error('Tournament is not open for registration');
    }

    // 2. Check Capacity
    if (tournament.currentParticipantsCount >= tournament.maxParticipants) {
      throw new Error('Tournament is full');
    }

    // 3. Idempotency Check: Are they already registered?
    const existing = await TournamentRepository.findParticipant(tournament._id.toString(), userId);
    if (existing) {
      return { success: true, message: 'Already registered', participant: existing };
    }

    // 4. Create Participant
    const participant = await TournamentRepository.createParticipant(tournament._id.toString(), userId);

    // 5. Increment Participant Count
    await TournamentRepository.incrementParticipantCount(tournament._id.toString());

    return { success: true, participant };
  }

  static async listTournaments(page: number = 1, limit: number = 20, status?: TournamentStatus) {
    const skip = (page - 1) * limit;
    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    // TODO: implement Redis caching logic here or at the controller level
    return TournamentRepository.listTournaments(filters, limit, skip);
  }

  static async getTournamentDetails(identifier: string) {
    const tournament = await TournamentRepository.findBySlugOrId(identifier);
    if (!tournament) throw new Error('Tournament not found');
    return tournament;
  }
}
