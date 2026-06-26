export declare class RatingService {
    private static K_FACTOR;
    static getRankBoundary(rating: number): string;
    static getRankBoundaries(): {
        name: string;
        min: number;
        max: number;
    }[];
    static calculateExpectedScore(ratingA: number, ratingB: number): number;
    static updateBattleRatings(battleId: string, winnerId: string | null, participantIds: string[], isTimeout?: boolean): Promise<any[]>;
    private static applyRatingChange;
}
//# sourceMappingURL=RatingService.d.ts.map