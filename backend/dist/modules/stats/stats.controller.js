import { User } from '../users/user.model.js';
import { Battle } from '../battles/battle.model.js';
export const getPlatformStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const battlesToday = await Battle.countDocuments({ createdAt: { $gte: today } });
        const topUser = await User.findOne().sort({ rating: -1 }).select('rating');
        const topRating = topUser?.rating || 3420;
        // We mock players online and problems solved for now since they require complex aggregations/redis active counts
        const playersOnline = Math.floor(Math.random() * 50) + 1200;
        const problemsSolved = '2.4M';
        res.status(200).json({
            success: true,
            data: {
                playersOnline: playersOnline.toLocaleString(),
                battlesToday: battlesToday.toLocaleString(),
                problemsSolved: problemsSolved,
                topRating: topRating.toString()
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch platform stats' });
    }
};
//# sourceMappingURL=stats.controller.js.map