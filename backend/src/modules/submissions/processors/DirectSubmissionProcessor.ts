import type { SubmissionProcessor } from './SubmissionProcessor.js';
import { Submission } from '../submission.model.js';
import { ProblemTestSuite } from '../../problems/problemTestSuite.model.js';
import { executionService } from '../execution/ExecutionService.js';
import { SubmissionEvaluator } from '../execution/SubmissionEvaluator.js';
import { evaluateSubmissionResult } from '../submission.evaluator.js';

export class DirectSubmissionProcessor implements SubmissionProcessor {
  async submit(submissionId: string): Promise<void> {
    const submission = await Submission.findById(submissionId).populate('problem');
    if (!submission) return;
    
    const problem = submission.problem as any;
    
    const testSuite = await ProblemTestSuite.findOne({ problemId: problem._id, version: problem.versions.testSuiteVersion });
    if (!testSuite) return;

    // Execute directly via Piston
    const executionResults = await executionService.executeBatch(
      submission.code,
      submission.language,
      testSuite.cases.map((tc: any) => ({ input: tc.input }))
    );

    const evaluatedResults = SubmissionEvaluator.evaluate(executionResults, testSuite.cases);

    // Map to the shape expected by the core system
    const mappedResults = evaluatedResults.map(res => ({
      status: {
        id: res.statusId,
        description: res.statusDescription
      },
      compile_output: res.compileOutput,
      stdout: res.stdout,
      time: res.time,
      memory: res.memory
    }));

    // Finally evaluate verdicts and update DB & clients
    await evaluateSubmissionResult(submissionId, mappedResults);
  }
}
