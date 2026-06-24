import type { Request, Response, NextFunction } from 'express';
import { Tournament } from './tournament.model.js';
import { TournamentParticipant } from './tournamentParticipant.model.js';
import { TournamentMatch } from './tournamentMatch.model.js';
import { TournamentEngine } from './tournament.engine.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';

export const getTournaments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: { tournaments } });
  } catch (error) {
    next(error);
  }
};

export const getTournament = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('winner', 'username name avatar rating');
      
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

    const participants = await TournamentParticipant.find({ tournamentId: tournament._id })
      .populate('userId', 'username name avatar rating');

    const matches = await TournamentMatch.find({ tournamentId: tournament._id })
      .populate('player1', 'username name avatar rating')
      .populate('player2', 'username name avatar rating')
      .populate('winner', 'username name avatar rating');

    return res.status(200).json({
      success: true,
      data: { tournament, participants, matches }
    });
  } catch (error) {
    next(error);
  }
};

export const joinTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || tournament.status !== 'REGISTRATION') {
      return res.status(400).json({ success: false, message: 'Tournament is not open for registration' });
    }

    const currentCount = await TournamentParticipant.countDocuments({ tournamentId: tournament._id });
    if (currentCount >= tournament.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Tournament is full' });
    }

    const existing = await TournamentParticipant.findOne({ tournamentId: tournament._id, userId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered' });
    }

    const participant = new TournamentParticipant({
      tournamentId: tournament._id,
      userId: req.user.id,
      status: 'REGISTERED'
    });
    await participant.save();

    return res.status(200).json({ success: true, data: { participant } });
  } catch (error) {
    next(error);
  }
};

export const checkInTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament || tournament.status !== 'CHECK_IN') {
      return res.status(400).json({ success: false, message: 'Tournament is not open for check-in' });
    }

    const participant = await TournamentParticipant.findOne({ tournamentId: tournament._id, userId: req.user.id });
    if (!participant) {
      return res.status(400).json({ success: false, message: 'You are not registered for this tournament' });
    }

    participant.status = 'CHECKED_IN';
    await participant.save();

    return res.status(200).json({ success: true, data: { participant } });
  } catch (error) {
    next(error);
  }
};

// Admin Endpoints
export const createTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, difficulty, battleDuration, maxParticipants, prizePool } = req.body;
    
    const tournament = new Tournament({
      title,
      description,
      difficulty,
      battleDuration,
      maxParticipants,
      prizePool,
      status: 'REGISTRATION', // Start directly in registration for MVP
      createdBy: req.user.id
    });
    
    await tournament.save();
    return res.status(201).json({ success: true, data: { tournament } });
  } catch (error) {
    next(error);
  }
};

export const startTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await TournamentEngine.startTournament(req.params.id as string); 
    return res.status(200).json({ success: true, message: 'Tournament started successfully' });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const openCheckIn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
    
    tournament.status = 'CHECK_IN';
    await tournament.save();
    
    return res.status(200).json({ success: true, message: 'Check-in phase started' });
  } catch (error) {
    next(error);
  }
};

export const cancelTournament = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
    
    tournament.status = 'CANCELLED';
    await tournament.save();
    
    return res.status(200).json({ success: true, message: 'Tournament cancelled' });
  } catch (error) {
    next(error);
  }
};
