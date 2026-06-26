import type { SubmissionProcessor } from './SubmissionProcessor.js';
import { Submission } from '../submission.model.js';
import { ProblemTestSuite } from '../../problems/problemTestSuite.model.js';
import { Judge0Service, LANGUAGE_MAPPING } from '../judge0.service.js';
import { evaluateSubmissionResult } from '../submission.evaluator.js';

export class PollingSubmissionProcessor implements SubmissionProcessor {
  async submit(submissionId: string): Promise<void> {
    const submission = await Submission.findById(submissionId).populate('problem');
    if (!submission) return;
    
    const problem = submission.problem as any;
    
    const testSuite = await ProblemTestSuite.findOne({ problemId: problem._id, version: problem.versions.testSuiteVersion });
    if (!testSuite) return;

    const judge0Submissions = testSuite.cases.map((tc: any) => ({
      language_id: LANGUAGE_MAPPING[submission.language],
      source_code: submission.code,
      stdin: tc.input,
      expected_output: tc.expectedOutput
    }));

    const tokens = await Judge0Service.submitBatch(judge0Submissions);
    submission.judge0Token = tokens.join(',');
    await submission.save();

    // Start polling
    this.poll(submissionId, tokens, 0);
  }

  private async poll(submissionId: string, tokens: string[], attempt: number) {
    if (attempt >= 15) {
      // Timeout, treat as internal error or time limit exceeded
      await evaluateSubmissionResult(submissionId, []);
      return;
    }

    setTimeout(async () => {
      try {
        const results = await Judge0Service.getBatchResults(tokens);
        const isFinished = results.every(r => r.status && r.status.id !== 1 && r.status.id !== 2);
        
        if (isFinished) {
          await evaluateSubmissionResult(submissionId, results);
        } else {
          this.poll(submissionId, tokens, attempt + 1);
        }
      } catch (error) {
        console.error('Polling error', error);
      }
    }, 1000);
  }
}
