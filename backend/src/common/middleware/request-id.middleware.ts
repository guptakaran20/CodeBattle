import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '../logger.js';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const reqId = req.headers['x-request-id'] || uuidv4();
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-ID', reqId);
  
  (req as any).id = reqId;

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId: reqId,
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userId: (req as any).user?.id || 'anonymous'
    }, 'Request completed');
  });

  next();
};
