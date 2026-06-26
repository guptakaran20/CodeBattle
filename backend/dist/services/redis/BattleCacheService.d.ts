export interface BattleCacheData {
    status: string;
    participants: number;
    startTime?: string;
    endTime?: string;
}
export declare class BattleCacheService {
    private static readonly TTL_SECONDS;
    static setBattle(battleCode: string, data: BattleCacheData): Promise<void>;
    static getBattle(battleCode: string): Promise<BattleCacheData | null>;
    static deleteBattle(battleCode: string): Promise<void>;
}
//# sourceMappingURL=BattleCacheService.d.ts.map