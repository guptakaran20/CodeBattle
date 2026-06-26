export declare class ReplayService {
    /**
     * Logs an event to MongoDB (Source of Truth) and optionally pushes to Redis Streams.
     */
    static logEvent(battleId: string, eventType: string, payload?: any): Promise<(import("mongoose").Document<unknown, {}, import("./battleEvent.model.js").IBattleEvent, {}, import("mongoose").DefaultSchemaOptions> & import("./battleEvent.model.js").IBattleEvent & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | undefined>;
    /**
     * Creates a lightweight summary snapshot when a battle completes.
     */
    static createSummary(battleId: string, winnerId: string | null | undefined, participantIds: string[], startedAt: Date, endedAt: Date, finalStatus: string, ratingDeltas?: any[]): Promise<(import("mongoose").Document<unknown, {}, import("./battleReplay.model.js").IBattleReplay, {}, import("mongoose").DefaultSchemaOptions> & import("./battleReplay.model.js").IBattleReplay & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | undefined>;
}
//# sourceMappingURL=replay.service.d.ts.map