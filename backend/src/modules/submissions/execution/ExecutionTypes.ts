export interface ExecutionResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  exitCode: number;
  cpuTime: number; // in milliseconds
  wallTime: number; // in milliseconds
  memory: number; // in bytes
  success: boolean;
}

export interface ExecutionOptions {
  timeout?: number; // CPU/execution timeout
  memoryLimit?: number; 
}

export interface CodeExecutor {
  execute(
    code: string,
    language: string,
    stdin: string,
    options?: ExecutionOptions
  ): Promise<ExecutionResult>;
}
