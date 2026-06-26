export interface SubmissionRequest {
    sourceCode: string;
    languageId: number;
    expectedOutput: string;
    stdin?: string;
}
export interface JudgeResult {
    statusId: number;
    stdout: string | null;
    stderr: string | null;
    compileOutput: string | null;
    time: number | null;
    memory: number | null;
}
export interface JudgeService {
    execute(request: SubmissionRequest): Promise<JudgeResult>;
    batchExecute(requests: SubmissionRequest[]): Promise<JudgeResult[]>;
}
//# sourceMappingURL=JudgeService.d.ts.map