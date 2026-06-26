import type { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}
//# sourceMappingURL=auth.types.d.ts.map