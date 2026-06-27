import type { CodeExecutor, ExecutionResult } from './ExecutionTypes.js';
import { PistonExecutor } from './PistonExecutor.js';

export class ExecutionService {
  private executor: CodeExecutor;

  constructor(executor?: CodeExecutor) {
    this.executor = executor || new PistonExecutor();
  }

  /**
   * Run a single piece of code (e.g. for "Run Code" functionality)
   */
  async run(code: string, language: string, stdin: string): Promise<ExecutionResult> {
    return this.executor.execute(code, language, stdin);
  }

  /**
   * Execute code against multiple test cases in parallel
   */
  async executeBatch(
    code: string,
    language: string,
    testCases: { input: string }[]
  ): Promise<ExecutionResult[]> {
    // Execute all test cases concurrently using Promise.all
    const executionPromises = testCases.map(tc => 
      this.executor.execute(code, language, tc.input)
    );

    return Promise.all(executionPromises);
  }
}

// Export a default singleton instance for convenience
export const executionService = new ExecutionService();
