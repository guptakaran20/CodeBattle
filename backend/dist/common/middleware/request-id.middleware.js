import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger.js';
export const requestIdMiddleware = (req, res, next) => {
    const reqId = req.headers['x-request-id'] || uuidv4();
    req.headers['x-request-id'] = reqId;
    res.setHeader('X-Request-ID', reqId);
    req.id = reqId;
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            requestId: reqId,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            userId: req.user?.id || 'anonymous'
        }, 'Request completed');
    });
    next();
};
//# sourceMappingURL=request-id.middleware.js.map