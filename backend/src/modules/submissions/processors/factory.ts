import type { SubmissionProcessor } from './SubmissionProcessor.js';
import { DirectSubmissionProcessor } from './DirectSubmissionProcessor.js';

export class SubmissionProcessorFactory {
  static getProcessor(): SubmissionProcessor {
    return new DirectSubmissionProcessor();
  }
}
