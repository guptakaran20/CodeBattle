import type { Request, Response } from 'express';
export declare const MatchmakingController: {
    joinQueue: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    leaveQueue: (req: Request, res: Response) => Promise<void>;
    getFeedHistory: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=matchmaking.controller.d.ts.map