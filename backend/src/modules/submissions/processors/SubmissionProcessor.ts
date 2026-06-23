export interface SubmissionProcessor {
  submit(submissionId: string): Promise<void>;
}
