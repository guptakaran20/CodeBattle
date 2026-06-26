export interface TokenPayload {
    userId: string;
    role: string;
    tokenVersion?: number;
}
export declare const generateAccessToken: (payload: {
    userId: string;
    role: string;
}) => string;
export declare const generateRefreshToken: (payload: {
    userId: string;
    role: string;
    tokenVersion: number;
}) => string;
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => TokenPayload;
//# sourceMappingURL=auth.utils.d.ts.map