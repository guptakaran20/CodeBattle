import { ProblemParser } from './ProblemParser.js';
import { TestCaseGenerator } from './TestCaseGenerator.js';
import { ImportValidator } from './ImportValidator.js';
import { Problem } from '../../modules/problems/problem.model.js';
import { ProblemTestSuite } from '../../modules/problems/problemTestSuite.model.js';
import { ImportLog } from '../../modules/problems/importLog.model.js';
import { ImportRun } from '../../modules/problems/importRun.model.js';

export class ProblemImporterService {
  private parser = new ProblemParser();
  private generator = new TestCaseGenerator();
  private validator = new ImportValidator();

  async runImport(targetEasy = 50, targetMedium = 50, targetHard = 50) {
    const run = await ImportRun.create({ startedAt: new Date() });
    
    console.log('Fetching problem list...');
    // Fetch way more than needed to account for failures/skips
    const list = await this.parser.fetchProblemList(500); 
    
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    for (const item of list) {
      if (easyCount >= targetEasy && mediumCount >= targetMedium && hardCount >= targetHard) {
        break;
      }

      const diff = item.difficulty.toUpperCase();
      if (diff === 'EASY' && easyCount >= targetEasy) continue;
      if (diff === 'MEDIUM' && mediumCount >= targetMedium) continue;
      if (diff === 'HARD' && hardCount >= targetHard) continue;

      const success = await this.importSingleProblem(item.titleSlug);
      
      if (success) {
        if (diff === 'EASY') easyCount++;
        if (diff === 'MEDIUM') mediumCount++;
        if (diff === 'HARD') hardCount++;
        run.published++;
      } else {
        run.failed++;
      }
      
      run.easyImported = easyCount;
      run.mediumImported = mediumCount;
      run.hardImported = hardCount;
      await run.save();
    }

    run.finishedAt = new Date();
    run.duration = run.finishedAt.getTime() - run.startedAt.getTime();
    await run.save();
    
    console.log(`Import run completed. Published: ${run.published}, Failed: ${run.failed}`);
  }

  async importSingleProblem(titleSlug: string): Promise<boolean> {
    console.log(`Importing problem: ${titleSlug}`);
    
    // Check if already exists
    const existing = await Problem.findOne({ slug: titleSlug });
    if (existing) {
      console.log(`Problem ${titleSlug} already exists. Skipping.`);
      return true; // considered success for quota
    }

    let parsed, drafted, validation;
    const errors: string[] = [];

    try {
      parsed = await this.parser.fetchProblemDetails(titleSlug);
    } catch (e: any) {
      errors.push(`Parse error: ${e.message}`);
      await this.logFailure(titleSlug, errors);
      return false;
    }

    try {
      drafted = await this.generator.draftScripts(parsed);
    } catch (e: any) {
      errors.push(`AI Generation error: ${e.message}`);
      await this.logFailure(titleSlug, errors, parsed.rawSource);
      return false;
    }

    validation = await this.validator.validate(drafted.generatorCode, drafted.referenceSolutionCode);
    
    if (validation.status === 'FAILED') {
      errors.push(...validation.errors);
      await this.logFailure(titleSlug, errors, parsed.rawSource, drafted.aiLogs, validation.executionTimeMs);
      return false;
    }

    // Success! Save everything to DB
    const problem = await Problem.create({
      leetcodeId: parsed.leetcodeId,
      title: parsed.title,
      slug: parsed.slug,
      difficulty: parsed.difficulty,
      statementHtml: parsed.statementHtml,
      examples: drafted.refinedExamples.length > 0 ? drafted.refinedExamples : parsed.examples,
      constraints: parsed.constraints,
      tags: parsed.tags,
      companies: parsed.companies,
      starterCodes: parsed.starterCodes,
      functionMetadata: drafted.functionMetadata,
      execution: { timeLimit: 2, memoryLimit: 256 },
      battle: { enabled: true, weight: 50 },
      contest: { visible: false },
      versions: { problemVersion: 1, testSuiteVersion: 1 },
      status: 'PUBLISHED',
    });

    await ProblemTestSuite.create({
      problemId: problem._id,
      version: 1,
      checkerType: 'STANDARD',
      generatedAt: new Date(),
      cases: validation.hiddenCases,
    });

    await ImportLog.create({
      problemSlug: titleSlug,
      validationStatus: validation.status,
      validationTime: validation.executionTimeMs,
      rawSource: parsed.rawSource,
      aiLogs: drafted.aiLogs,
      importErrors: [],
    });

    return true;
  }

  private async logFailure(slug: string, errors: string[], rawSource?: any, aiLogs?: any, validationTime = 0) {
    await ImportLog.create({
      problemSlug: slug,
      validationStatus: 'FAILED',
      validationTime,
      rawSource,
      aiLogs,
      importErrors: errors,
    });
  }
}
