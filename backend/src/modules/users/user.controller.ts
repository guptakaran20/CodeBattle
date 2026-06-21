import type { Request, Response, NextFunction } from 'express';
import { User } from './user.model.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username: username as string }).select('-refreshTokenVersion -email'); // Don't expose private info publicly
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_002' });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { bio, college, country, avatar, name } = req.body;
    
    // Only allow updating specific fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { bio, college, country, avatar, name } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_001' });
    }

    return res.status(200).json({ success: true, data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
};
