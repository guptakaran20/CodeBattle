import type { ClientSession } from 'mongoose';
import type { ITournament } from './tournament.model.js';
import type { ITournamentParticipant } from './tournamentParticipant.model.js';
export declare class TournamentRepository {
    static findById(id: string, session?: ClientSession): Promise<ITournament | null>;
    static findBySlugOrId(identifier: string, session?: ClientSession): Promise<ITournament | null>;
    static listTournaments(filters: any, limit: number, skip: number): Promise<ITournament[]>;
    static findParticipant(tournamentId: string, userId: string, session?: ClientSession): Promise<ITournamentParticipant | null>;
    static createParticipant(tournamentId: string, userId: string, session?: ClientSession): Promise<ITournamentParticipant>;
    static incrementParticipantCount(tournamentId: string, session?: ClientSession): Promise<ITournament | null>;
    static updateStatus(tournamentId: string, status: string): Promise<ITournament | null>;
}
//# sourceMappingURL=tournament.repository.d.ts.map