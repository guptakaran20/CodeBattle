export interface ParsedProblemData {
    leetcodeId: string;
    title: string;
    slug: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    statementHtml: string;
    tags: string[];
    companies: string[];
    examples: {
        input: string;
        output: string;
        explanation?: string;
    }[];
    constraints: string[];
    starterCodes: {
        language: string;
        version: string;
        code: string;
    }[];
    rawSource: any;
}
export declare class ProblemParser {
    private baseUrl;
    fetchProblemList(limit?: number): Promise<{
        titleSlug: string;
        difficulty: string;
    }[]>;
    fetchProblemDetails(titleSlug: string): Promise<ParsedProblemData>;
    private extractExamples;
    private extractConstraints;
}
//# sourceMappingURL=ProblemParser.d.ts.map