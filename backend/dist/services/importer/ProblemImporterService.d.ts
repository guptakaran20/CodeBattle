export declare class ProblemImporterService {
    private parser;
    private generator;
    private validator;
    runImport(targetEasy?: number, targetMedium?: number, targetHard?: number): Promise<void>;
    importSingleProblem(titleSlug: string): Promise<boolean>;
    private logFailure;
}
//# sourceMappingURL=ProblemImporterService.d.ts.map