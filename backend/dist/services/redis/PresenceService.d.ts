export declare class PresenceService {
    private static readonly TTL_SECONDS;
    /**
     * Adds or refreshes a user's presence in a battle room.
     */
    static setPresence(battleCode: string, userId: string): Promise<void>;
    /**
     * Removes a user's presence explicitly.
     */
    static removePresence(battleCode: string, userId: string): Promise<void>;
    /**
     * Gets all active participants in a battle room by scanning keys.
     * Note: For very large rooms, scanning is better than KEYS.
     */
    static getActiveParticipants(battleCode: string): Promise<string[]>;
}
//# sourceMappingURL=PresenceService.d.ts.map