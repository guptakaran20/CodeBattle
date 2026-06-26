import { User } from '../../modules/users/user.model.js';
export const requireGoogleVerification = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized', errorCode: 'AUTH_001' });
        }
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_001' });
        }
        if (!user.isGoogleVerified) {
            return res.status(403).json({ success: false, message: 'Google Verification Required', errorCode: 'AUTH_008' });
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=verification.middleware.js.map