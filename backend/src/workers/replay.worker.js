import { redis } from '../config/redis.js';
/**
 * An isolated worker class intended for consuming Redis Streams (e.g. battle_events).
 * In a production environment, this should be run in a separate process from the main API.
 * For now, it is abstracted here so it can be instantiated independently.
 */
export class ReplayWorker {
    isRunning = false;
    streamName = 'battle_events';
    groupName = 'replay_analytics_group';
    consumerName = `consumer-${Math.random().toString(36).substring(2, 9)}`;
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        console.log(`[ReplayWorker] Starting Redis Stream consumer: ${this.consumerName}`);
        try {
            // Ensure the consumer group exists. If it does, XGROUP CREATE will throw a BUSYGROUP error, which we can ignore.
            await redis.xgroup('CREATE', this.streamName, this.groupName, '$', 'MKSTREAM');
        }
        catch (err) {
            if (!err.message.includes('BUSYGROUP')) {
                console.error('[ReplayWorker] Error creating consumer group:', err);
            }
        }
        this.poll();
    }
    stop() {
        this.isRunning = false;
        console.log(`[ReplayWorker] Stopping consumer: ${this.consumerName}`);
    }
    async poll() {
        if (!this.isRunning)
            return;
        try {
            // Read new messages from the stream for this consumer group
            // Block for 2 seconds if no messages are available
            const results = await redis.xreadgroup('GROUP', this.groupName, this.consumerName, 'COUNT', 10, 'BLOCK', 2000, 'STREAMS', this.streamName, '>');
            if (results && results.length > 0) {
                const [stream, messages] = results[0];
                for (const message of messages) {
                    const [messageId, dataArray] = message;
                    const data = {};
                    // dataArray comes as [key1, val1, key2, val2, ...]
                    for (let i = 0; i < dataArray.length; i += 2) {
                        data[dataArray[i]] = dataArray[i + 1];
                    }
                    await this.processEvent(data);
                    // Acknowledge the message so it is removed from the pending entries list
                    await redis.xack(this.streamName, this.groupName, messageId);
                }
            }
        }
        catch (err) {
            console.error('[ReplayWorker] Error polling stream:', err);
        }
        // Continue polling
        if (this.isRunning) {
            setImmediate(() => this.poll());
        }
    }
    async processEvent(eventData) {
        // In the future, this is where live spectating, analytics processing,
        // or external webhook integrations would happen.
        // E.g., emitting a live spectator event:
        // io.to(`spectate_${eventData.battleId}`).emit('live_event', eventData);
        // For now, we just log that we processed it to show the consumer works.
        // console.log(`[ReplayWorker] Processed event ${eventData.eventType} for battle ${eventData.battleId}`);
    }
}
//# sourceMappingURL=replay.worker.js.map