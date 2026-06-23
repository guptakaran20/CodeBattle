import type { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcrypt';
import { User } from '../users/user.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from './auth.utils.js';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, username, email, password } = req.body;
    
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields', errorCode: 'AUTH_009' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email or username already in use', errorCode: 'AUTH_010' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      provider: 'local',
      isGoogleVerified: false
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, tokenVersion: user.refreshTokenVersion });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ success: true, data: { user: userObj } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields', errorCode: 'AUTH_011' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', errorCode: 'AUTH_012' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', errorCode: 'AUTH_012' });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, tokenVersion: user.refreshTokenVersion });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProduction, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, data: { user: userObj } });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential, accessToken: reqAccessToken } = req.body;
    if (!credential && !reqAccessToken) {
      return res.status(400).json({ success: false, message: 'No credential provided', errorCode: 'AUTH_003' });
    }

    let payload: any;
    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID as string,
      });
      payload = ticket.getPayload();
    } else if (reqAccessToken) {
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${reqAccessToken}` }
      });
      payload = await resp.json();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid token payload', errorCode: 'AUTH_004' });
    }

    let user = await User.findOne({ email: payload.email });
    
    if (!user) {
      const baseUsername = payload.email.split('@')[0] || 'user';
      let username = baseUsername;
      let count = 1;
      while (await User.exists({ username })) {
        username = `${baseUsername}${count}`;
        count++;
      }

      user = await User.create({
        name: payload.name || 'Anonymous',
        username,
        email: payload.email,
        ...(payload.picture ? { avatar: payload.picture } : {}),
        provider: 'google',
        isGoogleVerified: true,
      });
    } else if (!user.isGoogleVerified) {
      // User existed but wasn't verified, now they are
      user.isGoogleVerified = true;
      user.provider = 'both';
      await user.save();
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role, tokenVersion: user.refreshTokenVersion });

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const linkGoogle = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'No credential provided', errorCode: 'AUTH_003' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID as string,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid token payload', errorCode: 'AUTH_004' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_001' });
    }

    user.isGoogleVerified = true;
    user.provider = 'both';
    if (!user.avatar && payload.picture) user.avatar = payload.picture;
    await user.save();

    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token', errorCode: 'AUTH_005' });
    }

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);

    if (!user || user.refreshTokenVersion !== payload.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token', errorCode: 'AUTH_006' });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ success: true, data: { message: 'Token refreshed' } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token', errorCode: 'AUTH_007' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { refreshTokenVersion: 1 } });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_001' });
    }
    
    const hasPassword = !!user.password;
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({ success: true, data: { user: { ...userObj, hasPassword } } });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters', errorCode: 'AUTH_013' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', errorCode: 'USER_001' });
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required', errorCode: 'AUTH_014' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid current password', errorCode: 'AUTH_015' });
      }
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ success: true, data: { message: 'Password updated successfully' } });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential, accessToken: reqAccessToken, newPassword } = req.body;
    if ((!credential && !reqAccessToken) || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Missing fields or password too short', errorCode: 'AUTH_016' });
    }

    let payload: any;
    if (credential) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID as string,
      });
      payload = ticket.getPayload();
    } else if (reqAccessToken) {
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${reqAccessToken}` }
      });
      payload = await resp.json();
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token', errorCode: 'AUTH_004' });
    }

    const user = await User.findOne({ email: payload.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this Google email', errorCode: 'AUTH_017' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.isGoogleVerified = true;
    if (user.provider === 'local') {
      user.provider = 'both';
    }
    await user.save();

    return res.status(200).json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (error) {
    next(error);
  }
};
