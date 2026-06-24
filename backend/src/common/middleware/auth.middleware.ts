import type { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../modules/auth/auth.utils.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token = '';

    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken as string;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.split(' ')[1];
      if (bearerToken) token = bearerToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
        errorCode: 'AUTH_001',
      });
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired token',
      errorCode: 'AUTH_002',
    });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Admin access required', 
        errorCode: 'AUTH_003' 
      });
    }
  });
};
