import type { Request, Response, NextFunction } from 'express';
import { Battle } from './battle.model.js';
import { ReplayService } from '../replays/replay.service.js';
import { Problem } from '../problems/problem.model.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { BattleGatewayService } from '../websockets/battle.gateway.js';
import { getIO } from '../websockets/socket.service.js';
import { BattleCacheService } from '../../services/redis/BattleCacheService.js';
import { RatingService } from '../../services/ranking/RatingService.js';
import { TournamentEngine } from '../tournaments/tournament.engine.js';

const createBattleSchema = z.object({
  battleType: z.enum(['ONE_VS_ONE', 'TWO_VS_TWO', 'FOUR_VS_FOUR', 'TOURNAMENT']),
  battleMode: z.enum(['COMPETITIVE', 'PRACTICE']),
  maxParticipants: z.number().min(2),
  problemId: z.string(),
  durationMinutes: z.number().min(5).max(180),
  settings: z.object({
    visibility: z.enum(['PUBLIC', 'PRIVATE']).optional(),
    allowSpectators: z.boolean().optional(),
    aiReviewEnabled: z.boolean().optional()
  }).optional()
});

export const createBattle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = createBattleSchema.parse(req.body);

    const problem = await Problem.findById(validatedData.problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const battleCode = `CA-${nanoid(8).toUpperCase()}`;

    const initialTeams = [
      {
        teamId: 'team-1',
        members: [req.user.id]
      }
    ];

    const battle = await Battle.create({
      ...validatedData,
      battleCode,
      problem: problem._id,
      creator: req.user.id,
      teams: initialTeams,
      status: 'WAITING'
    } as any);

    await ReplayService.logEvent(battle._id.toString(), 'BattleCreated', { creator: req.user.id, battleCode });

    return res.status(201).json({ success: true, data: { battle } });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Validation error', errors: error.errors });
    }
    next(error);
  }
};

export const getBattleHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const battles = await Battle.find({ 'teams.members': req.user.id })
      .select('battleCode status battleType battleMode durationMinutes createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: { battles } });
  } catch (error) {
    next(error);
  }
};

export const getBattle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const battle = await Battle.findOne({ battleCode: req.params.battleCode as string })
      .populate('problem', 'title slug difficulty description examples constraints testcases starterCode')
      .populate('creator', 'username name')
      .populate('teams.members', 'username name avatar');
      
    if (!battle) {
      return res.status(404).json({ success: false, message: 'Battle not found' });
    }

    if (battle.status === 'IN_PROGRESS' && battle.startTime) {
      const endTime = battle.startTime.getTime() + battle.durationMinutes * 60000;
      if (Date.now() > endTime) {
        battle.status = 'COMPLETED';
        if (!battle.result) {
          battle.result = { winReason: 'TIMEOUT' };
        }
        await battle.save();
        
        await ReplayService.logEvent(battle._id.toString(), 'BattleCompleted', { reason: 'Timeout' });
        const participantIds = battle.teams.flatMap((t: any) => t.members.map((id: any) => id.toString()));
        const ratingDeltas = await RatingService.updateBattleRatings(battle._id.toString(), null, participantIds, true);
        await ReplayService.createSummary(
          battle._id.toString(),
          null,
          participantIds,
          battle.startTime,
          new Date(),
          'COMPLETED',
          ratingDeltas
        );
        
        if (battle.battleType === 'TOURNAMENT') {
          await TournamentEngine.advanceWinner(battle._id.toString(), null).catch(console.error);
        }
        
        await BattleCacheService.deleteBattle(battle.battleCode);
        
        try {
          const io = getIO();
          BattleGatewayService.broadcastBattleUpdated(io, battle.battleCode, 'Battle duration expired');
        } catch (e) {
          console.error('Socket not initialized or failed to broadcast', e);
        }
      }
    }

    // Filter out hidden testcases
    const battleObj = battle.toObject();
    if (battleObj.problem && (battleObj.problem as any).testcases) {
      (battleObj.problem as any).testcases = (battleObj.problem as any).testcases.filter((tc: any) => !tc.isHidden);
    }

    return res.status(200).json({ success: true, data: { battle: battleObj } });
  } catch (error) {
    next(error);
  }
};

export const joinBattle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const battle = await Battle.findOne({ battleCode: req.params.battleCode as string });
    if (!battle) {
      return res.status(404).json({ success: false, message: 'Battle not found' });
    }

    if (battle.status !== 'WAITING') {
      return res.status(400).json({ success: false, message: 'Battle is no longer waiting for players' });
    }

    const allMembers = battle.teams.flatMap(t => t.members.map(m => m.toString()));
    if (allMembers.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already in this battle' });
    }

    if (allMembers.length >= battle.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Battle is full' });
    }

    let team2 = battle.teams.find(t => t.teamId === 'team-2');
    if (!team2) {
      battle.teams.push({ teamId: 'team-2', members: [req.user.id] as any });
    } else {
      team2.members.push(req.user.id as any);
    }

    await battle.save();

    await ReplayService.logEvent(battle._id.toString(), 'PlayerJoined', { userId: req.user.id });

    // We don't necessarily need to emit USER_JOINED here because the gateway handles it when they connect via socket.
    // However, if they are already connected, the gateway will not know until they re-join.
    // Let's emit a battle updated event just in case, though the socket room will handle the state refresh.
    try {
      const io = getIO();
      BattleGatewayService.broadcastBattleUpdated(io, battle.battleCode, 'A player joined the battle');
    } catch (e) {
      console.error('Socket not initialized or failed to broadcast', e);
    }

    return res.status(200).json({ success: true, data: { message: 'Joined successfully', battle } });
  } catch (error) {
    next(error);
  }
};

export const startBattle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const battle = await Battle.findOne({ battleCode: req.params.battleCode as string });
    if (!battle) {
      return res.status(404).json({ success: false, message: 'Battle not found' });
    }

    if (battle.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the creator can start the battle' });
    }

    if (battle.status !== 'WAITING') {
      return res.status(400).json({ success: false, message: 'Battle cannot be started' });
    }

    const allMembers = battle.teams.flatMap(t => t.members);
    if (allMembers.length < 2) {
      return res.status(400).json({ success: false, message: 'Not enough players to start' });
    }

    battle.status = 'IN_PROGRESS';
    battle.startTime = new Date();
    await battle.save();

    await BattleCacheService.setBattle(battle.battleCode, {
      status: battle.status,
      participants: allMembers.length,
      startTime: battle.startTime.toISOString(),
      endTime: new Date(battle.startTime.getTime() + battle.durationMinutes * 60000).toISOString()
    });

    await ReplayService.logEvent(battle._id.toString(), 'BattleStarted', { startTime: battle.startTime });

    try {
      const io = getIO();
      const endTime = new Date(battle.startTime.getTime() + battle.durationMinutes * 60000);
      BattleGatewayService.broadcastBattleStarted(io, battle.battleCode, battle.startTime.toISOString(), endTime.toISOString());
    } catch (e) {
      console.error('Socket not initialized or failed to broadcast', e);
    }

    return res.status(200).json({ success: true, data: { message: 'Battle started', battle } });
  } catch (error) {
    next(error);
  }
};

export const cancelBattle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const battle = await Battle.findOne({ battleCode: req.params.battleCode as string });
    if (!battle) {
      return res.status(404).json({ success: false, message: 'Battle not found' });
    }

    if (battle.creator.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the creator can cancel the battle' });
    }

    if (battle.status === 'COMPLETED' || battle.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Battle is already finished or cancelled' });
    }

    battle.status = 'CANCELLED';
    await battle.save();

    await ReplayService.logEvent(battle._id.toString(), 'BattleCompleted', { reason: 'Cancelled by creator' });
    const participantIds = battle.teams.flatMap((t: any) => t.members.map((id: any) => id.toString()));
    await ReplayService.createSummary(
      battle._id.toString(),
      null,
      participantIds,
      battle.startTime || new Date(),
      new Date(),
      'CANCELLED'
    );

    try {
      const io = getIO();
      BattleGatewayService.broadcastBattleCancelled(io, battle.battleCode, 'Battle cancelled by host');
    } catch (e) {
      console.error('Socket not initialized or failed to broadcast', e);
    }

    return res.status(200).json({ success: true, data: { message: 'Battle cancelled' } });
  } catch (error) {
    next(error);
  }
};
