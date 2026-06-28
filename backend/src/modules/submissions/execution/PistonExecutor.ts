import axios from 'axios';
import type { CodeExecutor, ExecutionOptions, ExecutionResult } from './ExecutionTypes.js';
import { LanguageMapper } from './LanguageMapper.js';

export class PistonExecutor implements CodeExecutor {
  private get baseUrl(): string {
    const url = process.env.PISTON_URL;
    if (!url) {
      throw new Error('PISTON_URL environment variable is not set. Cannot execute code.');
    }
    return url;
  }

  private get defaultOptions(): ExecutionOptions {
    return {
      timeout: parseInt(process.env.EXECUTION_TIMEOUT || '5000', 10),
      memoryLimit: parseInt(process.env.EXECUTION_MEMORY || '268435456', 10) // 256MB
    };
  }

  async execute(
    code: string,
    language: string,
    stdin: string,
    options?: ExecutionOptions
  ): Promise<ExecutionResult> {
    const pistonConfig = LanguageMapper.getPistonConfig(language);
    const finalOptions = { ...this.defaultOptions, ...options };

    const payload = {
      language: pistonConfig.language,
      version: pistonConfig.version,
      files: [
        {
          name: 'main', // Piston uses this as a generic entry point
          content: code
        }
      ],
      stdin: stdin || '',
      compile_timeout: finalOptions.timeout,
      run_timeout: finalOptions.timeout,
      compile_memory_limit: finalOptions.memoryLimit,
      run_memory_limit: finalOptions.memoryLimit,
    };

    try {
      const response = await axios.post(`${this.baseUrl}/api/v2/execute`, payload);
      const data = response.data;

      // Piston v2 response structure:
      // {
      //   language: "python", version: "3.10.0",
      //   compile: { stdout: "", stderr: "", code: 0 },
      //   run: { stdout: "hello", stderr: "", code: 0, signal: null }
      // }

      let stdout = '';
      let stderr = '';
      let compileOutput = '';
      let exitCode = 0;
      let success = true;

      // Handle Compilation (if applicable)
      if (data.compile) {
        if (data.compile.stderr) {
          compileOutput = data.compile.stderr;
        }
        if (data.compile.code !== 0) {
          success = false;
          exitCode = data.compile.code || 1;
          // If compilation fails, run might be missing or skipped.
          return {
            stdout: '',
            stderr: '',
            compileOutput,
            exitCode,
            cpuTime: 0,
            wallTime: 0,
            memory: 0,
            success
          };
        }
      }

      // Handle Runtime
      if (data.run) {
        stdout = data.run.stdout || '';
        stderr = data.run.stderr || '';
        exitCode = data.run.code || 0;
        
        // Sometimes signal is returned on memory/time limits, e.g., SIGKILL
        if (data.run.signal || exitCode !== 0) {
          success = false;
          if (data.run.signal === 'SIGKILL') {
            stderr = 'Process killed (Time or Memory limit exceeded)';
          }
        }
      }

      return {
        stdout,
        stderr,
        compileOutput,
        exitCode,
        cpuTime: 0, // Piston doesn't reliably provide metrics yet, mock or use defaults
        wallTime: 0,
        memory: 0,
        success
      };

    } catch (error: any) {
      console.error('Piston Execution Error:', error.message);
      if (error.response) {
        console.error('Piston Response Status:', error.response.status);
        console.error('Piston Response Data:', error.response.data);
      } else if (error.request) {
        console.error('Piston No Response Received. Request:', error.request);
      } else {
        console.error('Piston Error Object:', error);
      }
      return {
        stdout: '',
        stderr: 'Execution Engine Error',
        compileOutput: '',
        exitCode: -1,
        cpuTime: 0,
        wallTime: 0,
        memory: 0,
        success: false
      };
    }
  }
}
