import type { ExecutionResult } from './ExecutionTypes.js';

export interface EvaluatedResult {
  statusId: number;
  statusDescription: string;
  stdout: string;
  compileOutput: string;
  memory: number;
  time: number;
}

export class SubmissionEvaluator {
  /**
   * Compares the execution output with the expected output to determine the verdict.
   */
  static evaluate(
    results: ExecutionResult[],
    testCases: { expectedOutput: string }[]
  ): EvaluatedResult[] {
    return results.map((result, index) => {
      const expected = testCases[index]?.expectedOutput || '';
      
      let statusId = 3; // Accepted
      let statusDescription = 'Accepted';

      if (!result.success) {
        if (result.compileOutput) {
          statusId = 6;
          statusDescription = 'Compilation Error';
        } else if (result.stderr && result.stderr.includes('Time or Memory limit exceeded')) {
          // Piston signal mapping for limits
          statusId = 5; 
          statusDescription = 'Time Limit Exceeded';
        } else {
          statusId = 11;
          statusDescription = 'Runtime Error';
        }
      } else {
        // Successful execution, compare outputs
        const actualOutput = this.normalizeString(result.stdout);
        const expectedOutput = this.normalizeString(expected);

        if (actualOutput !== expectedOutput) {
          statusId = 4;
          statusDescription = 'Wrong Answer';
        }
      }

      return {
        statusId,
        statusDescription,
        // Frontend expects base64 encoded strings
        stdout: Buffer.from(result.stdout).toString('base64'),
        compileOutput: Buffer.from(result.compileOutput || result.stderr).toString('base64'),
        memory: result.memory || 0,
        time: result.cpuTime || 0,
      };
    });
  }

  /**
   * Normalizes strings by trimming whitespace and unifying line endings.
   */
  private static normalizeString(str: string): string {
    return str
      .replace(/\r\n/g, '\n') // Normalize CRLF to LF
      .trim()                 // Remove leading/trailing whitespaces
      .split('\n')            // Split by lines
      .map(line => line.trimEnd()) // Remove trailing whitespace per line
      .join('\n');
  }
}
