export interface CodeReviewResult {
  timeComplexity: string;
  spaceComplexity: string;
  missedEdgeCases: string[];
  bestPracticesScore: number;
  markdownCritique: string;
}

export interface GeneratedProblem {
  title: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: { CPP?: string; JAVA?: string; PYTHON?: string };
  testcases: { input: string; expectedOutput: string; isHidden: boolean }[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface IAIProvider {
  generateCodeReview(submissionCode: string, language: string, problemDescription: string): Promise<CodeReviewResult>;
  generateSimilarProblem(topicOrBaseProblem: string): Promise<GeneratedProblem>;
}
