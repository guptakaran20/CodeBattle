import { TournamentStatus } from '../../constants/tournament.js';
export declare class TournamentService {
    /**
     * Registers a user for a tournament with full transactional safety.
     */
    static registerParticipant(identifier: string, userId: string): Promise<{
        success: boolean;
        message: string;
        participant: import("./tournamentParticipant.model.js").ITournamentParticipant;
    } | {
        success: boolean;
        participant: import("./tournamentParticipant.model.js").ITournamentParticipant;
        message?: never;
    }>;
    static listTournaments(page?: number, limit?: number, status?: TournamentStatus): Promise<import("./tournament.model.js").ITournament[]>;
    static getTournamentDetails(identifier: string): Promise<import("./tournament.model.js").ITournament>;
}
//# sourceMappingURL=tournament.service.d.ts.map