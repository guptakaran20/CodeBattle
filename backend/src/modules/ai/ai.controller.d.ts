import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
export declare const generateCodeReview: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export declare const generateSimilarProblem: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=ai.controller.d.ts.map