/**
 * An isolated worker class intended for consuming Redis Streams (e.g. battle_events).
 * In a production environment, this should be run in a separate process from the main API.
 * For now, it is abstracted here so it can be instantiated independently.
 */
export declare class ReplayWorker {
    private isRunning;
    private streamName;
    private groupName;
    private consumerName;
    start(): Promise<void>;
    stop(): void;
    private poll;
    private processEvent;
}
//# sourceMappingURL=replay.worker.d.ts.map