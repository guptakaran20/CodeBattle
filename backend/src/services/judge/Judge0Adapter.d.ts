import type { JudgeService, JudgeResult, SubmissionRequest } from './JudgeService.js';
export declare class Judge0Adapter implements JudgeService {
    private baseUrl;
    private apiKey;
    private get headers();
    execute(request: SubmissionRequest): Promise<JudgeResult>;
    batchExecute(requests: SubmissionRequest[]): Promise<JudgeResult[]>;
}
//# sourceMappingURL=Judge0Adapter.d.ts.map