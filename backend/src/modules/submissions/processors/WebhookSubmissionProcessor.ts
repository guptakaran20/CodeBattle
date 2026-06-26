import type { SubmissionProcessor } from './SubmissionProcessor.js';
import { Submission } from '../submission.model.js';
import { ProblemTestSuite } from '../../problems/problemTestSuite.model.js';
import { Judge0Service, LANGUAGE_MAPPING } from '../judge0.service.js';

export class WebhookSubmissionProcessor implements SubmissionProcessor {
  async submit(submissionId: string): Promise<void> {
    const submission = await Submission.findById(submissionId).populate('problem');
    if (!submission) return;
    
    const problem = submission.problem as any;
    const webhookUrl = `${process.env.BACKEND_URL}/api/judge0/webhook`;

    const testSuite = await ProblemTestSuite.findOne({ problemId: problem._id, version: problem.versions.testSuiteVersion });
    if (!testSuite) return;

    const judge0Submissions = testSuite.cases.map((tc: any) => ({
      language_id: LANGUAGE_MAPPING[submission.language],
      source_code: submission.code,
      stdin: tc.input,
      expected_output: tc.expectedOutput
    }));

    const tokens = await Judge0Service.submitBatch(judge0Submissions, webhookUrl);
    submission.judge0Token = tokens.join(',');
    await submission.save();
  }
}
