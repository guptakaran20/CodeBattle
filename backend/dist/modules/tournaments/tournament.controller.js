import { Tournament } from './tournament.model.js';
import { TournamentParticipant } from './tournamentParticipant.model.js';
import { TournamentMatch } from './tournamentMatch.model.js';
import { TournamentRepository } from './tournament.repository.js';
import { TournamentEngine } from './tournament.engine.js';
import { TournamentService } from './tournament.service.js';
import { NotificationService } from '../../services/notifications/NotificationService.js';
import { TournamentStatus } from '../../constants/tournament.js';
export const getTournaments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const tournaments = await TournamentService.listTournaments(page, limit, status);
        return res.status(200).json({ success: true, data: { tournaments } });
    }
    catch (error) {
        next(error);
    }
};
export const getTournament = async (req, res, next) => {
    try {
        // Identifier can be either slug or id
        const identifier = (req.params.slug || req.params.id);
        const tournament = await TournamentService.getTournamentDetails(identifier);
        // For now we keep the populate logic in controller, but ideally move to repo
        // We are maintaining the existing behavior for details fetching as requested
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
    }
    catch (error) {
        next(error);
    }
};
export const joinTournament = async (req, res, next) => {
    try {
        const identifier = (req.params.slug || req.params.id);
        const result = await TournamentService.registerParticipant(identifier, req.user.id);
        return res.status(200).json(result);
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
export const checkInTournament = async (req, res, next) => {
    try {
        const tournament = await TournamentRepository.findBySlugOrId(req.params.id);
        if (!tournament || tournament.status !== TournamentStatus.CHECK_IN) {
            return res.status(400).json({ success: false, message: 'Tournament is not open for check-in' });
        }
        const participant = await TournamentParticipant.findOne({ tournamentId: tournament._id, userId: req.user.id });
        if (!participant) {
            return res.status(400).json({ success: false, message: 'You are not registered for this tournament' });
        }
        participant.status = 'CHECKED_IN';
        await participant.save();
        return res.status(200).json({ success: true, data: { participant } });
    }
    catch (error) {
        next(error);
    }
};
// Admin Endpoints
export const createTournament = async (req, res, next) => {
    try {
        const { title, description, difficulty, battleDuration, maxParticipants, prizePool, startTime } = req.body;
        // Generate slug and shortId
        const shortId = 'TNMT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + shortId.toLowerCase();
        const tournament = new Tournament({
            title,
            slug,
            shortId,
            description,
            difficulty,
            battleDuration,
            maxParticipants,
            prizePool,
            startTime: startTime ? new Date(startTime) : undefined,
            status: TournamentStatus.REGISTRATION, // Start directly in registration for MVP
            createdBy: req.user.id
        });
        await tournament.save();
        return res.status(201).json({ success: true, data: { tournament } });
    }
    catch (error) {
        next(error);
    }
};
export const startTournament = async (req, res, next) => {
    try {
        const tournament = await TournamentRepository.findBySlugOrId(req.params.id);
        if (!tournament)
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        await TournamentEngine.startTournament(req.params.id);
        // Notify all participants
        const participants = await TournamentParticipant.find({ tournamentId: tournament._id });
        for (const p of participants) {
            await NotificationService.send(p.userId.toString(), {
                type: 'TOURNAMENT_STARTED',
                title: 'Tournament Started!',
                message: `The tournament "${tournament.title}" has officially begun. Good luck!`,
                data: { tournamentId: tournament._id.toString() }
            });
        }
        return res.status(200).json({ success: true, message: 'Tournament started successfully' });
    }
    catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};
export const openCheckIn = async (req, res, next) => {
    try {
        const tournament = await TournamentRepository.findBySlugOrId(req.params.id);
        if (!tournament)
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        // Backfill for older tournaments created before these fields were required
        if (!tournament.shortId)
            tournament.shortId = 'TNMT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        if (!tournament.slug)
            tournament.slug = tournament.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + tournament.shortId.toLowerCase();
        tournament.status = TournamentStatus.CHECK_IN;
        await tournament.save();
        // Notify all participants
        const participants = await TournamentParticipant.find({ tournamentId: tournament._id });
        for (const p of participants) {
            await NotificationService.send(p.userId.toString(), {
                type: 'SYSTEM',
                title: 'Check-in Open',
                message: `Check-in is now open for "${tournament.title}". Please check in to confirm your participation!`,
                data: { tournamentId: tournament._id.toString() }
            });
        }
        return res.status(200).json({ success: true, message: 'Check-in phase started' });
    }
    catch (error) {
        next(error);
    }
};
export const cancelTournament = async (req, res, next) => {
    try {
        const tournament = await TournamentRepository.findBySlugOrId(req.params.id);
        if (!tournament)
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        // Backfill for older tournaments created before these fields were required
        if (!tournament.shortId)
            tournament.shortId = 'TNMT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        if (!tournament.slug)
            tournament.slug = tournament.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + tournament.shortId.toLowerCase();
        tournament.status = TournamentStatus.CANCELLED;
        await tournament.save();
        // Notify all participants
        const participants = await TournamentParticipant.find({ tournamentId: tournament._id });
        for (const p of participants) {
            await NotificationService.send(p.userId.toString(), {
                type: 'SYSTEM',
                title: 'Tournament Cancelled',
                message: `The tournament "${tournament.title}" has been cancelled.`,
                data: { tournamentId: tournament._id.toString() }
            });
        }
        return res.status(200).json({ success: true, message: 'Tournament cancelled' });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=tournament.controller.js.map