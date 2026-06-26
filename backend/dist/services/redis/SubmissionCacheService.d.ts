export interface SubmissionCacheData {
    status: string;
    judge0Token?: string;
    passed?: boolean;
}
export declare class SubmissionCacheService {
    private static readonly TTL_SECONDS;
    static setSubmission(id: string, data: SubmissionCacheData): Promise<void>;
    static getSubmission(id: string): Promise<SubmissionCacheData | null>;
    static updateStatus(id: string, status: string, passed?: boolean): Promise<void>;
    static deleteSubmission(id: string): Promise<void>;
}
//# sourceMappingURL=SubmissionCacheService.d.ts.map