import { Server } from 'socket.io';
export declare const initializeBattleGateway: (io: Server) => void;
export declare const BattleGatewayService: {
    broadcastBattleUpdated: (io: Server, battleCode: string, message: string) => void;
    broadcastBattleStarted: (io: Server, battleCode: string, startTime: string, endTime: string) => void;
    broadcastBattleCancelled: (io: Server, battleCode: string, reason: string) => void;
    broadcastWinner: (io: Server, battleCode: string, winnerId: string, username: string, message?: string) => void;
    broadcastBattleCompleted: (io: Server, battleCode: string) => void;
    broadcastGlobalFeed: (io: Server, payload: any) => void;
    getFeedHistory: () => any[];
};
//# sourceMappingURL=battle.gateway.d.ts.map