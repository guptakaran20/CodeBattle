import type { ParsedProblemData } from './ProblemParser.js';
export interface DraftedTestsAndSolutions {
    generatorCode: string;
    referenceSolutionCode: string;
    refinedExamples: {
        input: string;
        output: string;
        explanation: string;
    }[];
    functionMetadata: {
        functionName: string;
        returnType: string;
        parameters: string;
    };
    aiLogs: any;
}
export declare class TestCaseGenerator {
    private genAI;
    private model;
    constructor();
    draftScripts(problem: ParsedProblemData): Promise<DraftedTestsAndSolutions>;
}
//# sourceMappingURL=TestCaseGenerator.d.ts.map