export declare class TournamentEngine {
    /**
     * Spawns a battle for a given tournament match node.
     */
    private static spawnBattle;
    /**
     * Starts a tournament, generates the bracket, and spawns the first round.
     */
    static startTournament(tournamentId: string): Promise<void>;
    /**
     * Handles logic when a tournament battle concludes.
     */
    static advanceWinner(battleId: string, winnerId: string | null): Promise<void>;
}
//# sourceMappingURL=tournament.engine.d.ts.map