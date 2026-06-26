import { Server, Socket } from 'socket.io';
import { SocketEvents } from './events.js';
import type { JoinRoomPayload, BattleStatePayload } from './socket.types.js';
import { Battle } from '../battles/battle.model.js';
import { PresenceService } from '../../services/redis/PresenceService.js';
import { MatchmakingService } from '../../services/redis/MatchmakingService.js';
import { ReplayService } from '../replays/replay.service.js';

// Track disconnect timeouts: userId -> NodeJS.Timeout
const userDisconnectTimeouts = new Map<string, NodeJS.Timeout>();

// Global Feed History
const feedHistory: any[] = [];

export const initializeBattleGateway = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    // Join a private room for this user to receive sensitive direct messages (like full verdicts)
    if (user && user._id) {
      socket.join(`user_${user._id.toString()}`);
    }

    socket.on(SocketEvents.JOIN_ROOM, async (payload: JoinRoomPayload) => {
      try {
        const { battleCode } = payload;
        
        const query = battleCode.match(/^[0-9a-fA-F]{24}$/) 
          ? { $or: [{ _id: battleCode }, { battleCode: battleCode }] }
          : { battleCode };

        const battle = await Battle.findOne(query).populate('creator', 'username').populate('teams.members', 'username');
        if (!battle) {
          socket.emit(SocketEvents.ERROR, { message: 'Battle not found' });
          return;
        }

        socket.join(`battle_${battle.battleCode}`);
        (socket as any).currentBattleCode = battle.battleCode;
        (socket as any).currentBattleId = battle._id.toString();

        // Clear any pending disconnect timeout for this user
        if (userDisconnectTimeouts.has(user._id.toString())) {
          clearTimeout(userDisconnectTimeouts.get(user._id.toString()));
          userDisconnectTimeouts.delete(user._id.toString());
        }

        // Update Presence via Redis
        const userIdStr = user._id.toString();
        const existingParticipants = await PresenceService.getActiveParticipants(battle.battleCode);
        const isNewJoin = !existingParticipants.includes(userIdStr);
        
        await PresenceService.setPresence(battle.battleCode, userIdStr);

        // Fetch refreshed participants
        const updatedParticipants = await PresenceService.getActiveParticipants(battle.battleCode);

        // Emit Initial State Sync
        const statePayload: BattleStatePayload = {
          battleCode: battle.battleCode,
          status: battle.status,
          battleType: battle.battleType,
          battleMode: battle.battleMode,
          creatorId: battle.creator._id.toString(),
          participants: updatedParticipants,
        };
        
        if (battle.startTime) {
          statePayload.startTime = battle.startTime.toISOString();
        }
        
        socket.emit(SocketEvents.BATTLE_STATE, statePayload);

        // Broadcast to others if this user is newly joining the presence set
        if (isNewJoin) {
          socket.to(`battle_${battle.battleCode}`).emit(SocketEvents.USER_JOINED, {
            userId: user._id.toString(),
            username: user.username
          });
        }

        // Heartbeat handler to refresh TTL
        socket.on('presence_heartbeat', async () => {
          await PresenceService.setPresence(battle.battleCode, user._id.toString());
        });

      } catch (error) {
        socket.emit(SocketEvents.ERROR, { message: 'Internal server error while joining room' });
      }
    });

    socket.on('disconnect', async () => {
      // 1. Remove from matchmaking queue instantly
      if (user && user._id) {
        await MatchmakingService.leaveQueue(user._id.toString());
      }

      // 2. Handle battle presence disconnect
      const battleCode = (socket as any).currentBattleCode;
      if (!battleCode) return;

      // 15 seconds grace period for network hiccups
      const timeout = setTimeout(async () => {
        await PresenceService.removePresence(battleCode, user._id.toString());
        
        const updatedParticipants = await PresenceService.getActiveParticipants(battleCode);
        
        // Broadcast user left
        io.to(`battle_${battleCode}`).emit(SocketEvents.USER_LEFT, {
          userId: user._id.toString()
        });

        const battleId = (socket as any).currentBattleId;
        if (battleId) {
          await ReplayService.logEvent(battleId, 'PlayerLeft', { userId: user._id.toString() });
        }

        userDisconnectTimeouts.delete(user._id.toString());
      }, 15000);

      userDisconnectTimeouts.set(user._id.toString(), timeout);
    });
  });
};

// Expose broadcast methods for the HTTP controllers
export const BattleGatewayService = {
  broadcastBattleUpdated: (io: Server, battleCode: string, message: string) => {
    io.to(`battle_${battleCode}`).emit(SocketEvents.BATTLE_UPDATED, { battleCode, message });
  },

  broadcastBattleStarted: (io: Server, battleCode: string, startTime: string, endTime: string) => {
    io.to(`battle_${battleCode}`).emit(SocketEvents.BATTLE_STARTED, { battleCode, startTime, endTime });
  },
  
  broadcastBattleCancelled: (io: Server, battleCode: string, reason: string) => {
    io.to(`battle_${battleCode}`).emit(SocketEvents.BATTLE_CANCELLED, { battleCode, reason });
  },

  broadcastWinner: (io: Server, battleCode: string, winnerId: string, username: string, message?: string) => {
    io.to(`battle_${battleCode}`).emit(SocketEvents.WINNER_DECLARED, { userId: winnerId, username, message });
  },

  broadcastBattleCompleted: (io: Server, battleCode: string) => {
    io.to(`battle_${battleCode}`).emit(SocketEvents.BATTLE_COMPLETED, { battleCode });
  },

  broadcastGlobalFeed: (io: Server, payload: any) => {
    // Remove previous events for the same battle to avoid duplicates
    if (payload.battleCode) {
      const index = feedHistory.findIndex(item => item.battleCode === payload.battleCode);
      if (index !== -1) feedHistory.splice(index, 1);
    }
    
    feedHistory.unshift(payload);
    if (feedHistory.length > 5) feedHistory.pop();
    
    io.emit(SocketEvents.GLOBAL_FEED_UPDATE, payload);
  },

  getFeedHistory: () => {
    return feedHistory;
  }
};
