import { User } from './user.model.js';
import { UserRatingEvent } from '../leaderboard/userRatingEvent.model.js';
export const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username }).select('-refreshTokenVersion -email'); // Don't expose private info publicly
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_002' });
        }
        return res.status(200).json({ success: true, data: { user } });
    }
    catch (error) {
        next(error);
    }
};
export const updateMe = async (req, res, next) => {
    try {
        const { bio, college, country, avatar, name } = req.body;
        // Only allow updating specific fields
        const updatedUser = await User.findByIdAndUpdate(req.user.id, { $set: { bio, college, country, avatar, name } }, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_001' });
        }
        return res.status(200).json({ success: true, data: { user: updatedUser } });
    }
    catch (error) {
        next(error);
    }
};
export const getRatingHistory = async (req, res, next) => {
    try {
        const history = await UserRatingEvent.find({ userId: req.user.id })
            .sort({ createdAt: 1 })
            .limit(50); // Get last 50 matches for the graph
        return res.status(200).json({ success: true, data: { history } });
    }
    catch (error) {
        next(error);
    }
};
export const getPublicRatingHistory = async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username }).select('_id');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_002' });
        }
        const history = await UserRatingEvent.find({ userId: user._id })
            .sort({ createdAt: 1 })
            .limit(50);
        return res.status(200).json({ success: true, data: { history } });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=user.controller.js.map