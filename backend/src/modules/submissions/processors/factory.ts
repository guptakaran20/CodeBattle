import type { SubmissionProcessor } from './SubmissionProcessor.js';
import { PollingSubmissionProcessor } from './PollingSubmissionProcessor.js';
import { WebhookSubmissionProcessor } from './WebhookSubmissionProcessor.js';

export class SubmissionProcessorFactory {
  static getProcessor(): SubmissionProcessor {
    if (process.env.JUDGE0_MODE === 'webhook') {
      return new WebhookSubmissionProcessor();
    }
    return new PollingSubmissionProcessor();
  }
}
