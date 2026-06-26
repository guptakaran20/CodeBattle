export interface ValidationResult {
    status: 'PASSED' | 'FAILED' | 'MANUAL_REVIEW';
    hiddenCases: {
        input: string;
        expectedOutput: string;
        weight: number;
        isEdgeCase: boolean;
        group: string;
    }[];
    errors: string[];
    executionTimeMs: number;
}
export declare class ImportValidator {
    validate(generatorCode: string, referenceSolutionCode: string): Promise<ValidationResult>;
}
//# sourceMappingURL=ImportValidator.d.ts.map