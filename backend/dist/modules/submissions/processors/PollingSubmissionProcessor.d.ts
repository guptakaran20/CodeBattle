import type { SubmissionProcessor } from './SubmissionProcessor.js';
export declare class PollingSubmissionProcessor implements SubmissionProcessor {
    submit(submissionId: string): Promise<void>;
    private poll;
}
//# sourceMappingURL=PollingSubmissionProcessor.d.ts.map