export declare class BracketGenerator {
    /**
     * Generates a single-elimination tournament bracket using standard sports seeding.
     * Participants are sorted by rating (highest = #1 seed).
     *
     * @param tournamentId The ID of the tournament
     * @param maxParticipants Expected number of participants (must be a power of 2)
     */
    static generateBracket(tournamentId: string, maxParticipants: number): Promise<boolean>;
}
//# sourceMappingURL=bracket.generator.d.ts.map