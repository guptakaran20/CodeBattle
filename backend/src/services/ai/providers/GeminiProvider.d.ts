import type { IAIProvider, CodeReviewResult, GeneratedProblem } from '../IAIProvider.js';
export declare class GeminiProvider implements IAIProvider {
    private genAI;
    constructor();
    generateCodeReview(submissionCode: string, language: string, problemDescription: string): Promise<CodeReviewResult>;
    generateSimilarProblem(topicOrBaseProblem: string): Promise<GeneratedProblem>;
}
//# sourceMappingURL=GeminiProvider.d.ts.map