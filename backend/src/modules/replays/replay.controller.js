import { BattleEvent } from './battleEvent.model.js';
import { BattleReplay } from './battleReplay.model.js';
import { User } from '../users/user.model.js';
export const ReplayController = {
    getSummary: async (req, res, next) => {
        try {
            const { battleId } = req.params;
            const summary = await BattleReplay.findOne({ battleId: battleId })
                .populate('winner', 'username avatar rating')
                .populate('participants', 'username avatar rating');
            if (!summary) {
                return res.status(404).json({ success: false, message: 'Replay summary not found' });
            }
            return res.status(200).json({ success: true, data: { summary } });
        }
        catch (error) {
            next(error);
        }
    },
    getTimeline: async (req, res, next) => {
        try {
            const { battleId } = req.params;
            const events = await BattleEvent.find({ battleId: battleId }).sort({ sequenceNumber: 1 });
            if (!events || events.length === 0) {
                return res.status(404).json({ success: false, message: 'No events found for this battle' });
            }
            // We need to resolve userIds to usernames for a frontend-friendly timeline
            const userIdsToFetch = new Set();
            events.forEach(e => {
                if (e.payload?.userId)
                    userIdsToFetch.add(e.payload.userId.toString());
                if (e.payload?.creator)
                    userIdsToFetch.add(e.payload.creator.toString());
            });
            const users = await User.find({ _id: { $in: Array.from(userIdsToFetch) } }).select('username');
            const userMap = new Map(users.map(u => [u._id.toString(), u.username]));
            // Optionally determine battle start time to show relative times (MM:SS)
            const startEvent = events.find(e => e.eventType === 'BattleStarted');
            const startTime = startEvent ? startEvent.timestamp.getTime() : events[0].timestamp.getTime();
            const formatRelativeTime = (timestamp) => {
                const diffSeconds = Math.max(0, Math.floor((timestamp.getTime() - startTime) / 1000));
                const m = Math.floor(diffSeconds / 60).toString().padStart(2, '0');
                const s = (diffSeconds % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
            };
            const timeline = events.map(event => {
                const timeStr = formatRelativeTime(event.timestamp);
                const p = event.payload || {};
                // Build a frontend friendly summary string
                let summaryText = '';
                const username = p.userId ? (userMap.get(p.userId.toString()) || 'Unknown User') : 'System';
                switch (event.eventType) {
                    case 'BattleCreated':
                        summaryText = `Battle was created.`;
                        break;
                    case 'PlayerJoined':
                        summaryText = `${username} joined the lobby.`;
                        break;
                    case 'PlayerLeft':
                        summaryText = `${username} left the lobby.`;
                        break;
                    case 'BattleStarted':
                        summaryText = `Battle started!`;
                        break;
                    case 'SubmissionPending':
                        summaryText = `${username} ran code (Judging).`;
                        break;
                    case 'SubmissionAccepted':
                        summaryText = `${username} got Accepted.`;
                        break;
                    case 'WrongAnswer':
                    case 'TimeLimitExceeded':
                    case 'CompilationError':
                    case 'RUNTIME_ERROR':
                        summaryText = `${username} got ${event.eventType}.`;
                        break;
                    case 'PlayerWon':
                        summaryText = `${username} won the battle!`;
                        break;
                    case 'BattleCompleted':
                        summaryText = `Battle completed. (${p.reason || 'Finished'})`;
                        break;
                    default:
                        summaryText = `${event.eventType} occurred.`;
                }
                return {
                    id: event._id,
                    sequenceNumber: event.sequenceNumber,
                    time: timeStr,
                    absoluteTime: event.timestamp,
                    eventType: event.eventType,
                    summaryText,
                    metadata: event.payload
                };
            });
            return res.status(200).json({ success: true, data: { timeline } });
        }
        catch (error) {
            next(error);
        }
    },
    getRawEvents: async (req, res, next) => {
        try {
            const { battleId } = req.params;
            const events = await BattleEvent.find({ battleId: battleId }).sort({ sequenceNumber: 1 });
            return res.status(200).json({ success: true, data: { events } });
        }
        catch (error) {
            next(error);
        }
    }
};
//# sourceMappingURL=replay.controller.js.map