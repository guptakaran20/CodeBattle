import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ParsedProblemData } from './ProblemParser.js';

export interface DraftedTestsAndSolutions {
  generatorCode: string;
  referenceSolutionCode: string;
  refinedExamples: { input: string; output: string; explanation: string }[];
  functionMetadata: { functionName: string; returnType: string; parameters: string };
  aiLogs: any;
}

export class TestCaseGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async draftScripts(problem: ParsedProblemData): Promise<DraftedTestsAndSolutions> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not set. Using mock test cases and reference solution for problem:', problem.title);
      return {
        generatorCode: "print('1')\nprint('---TEST---')\nprint('2')",
        referenceSolutionCode: "import sys\nfor line in sys.stdin:\n    print(line.strip())",
        refinedExamples: [
          { input: "1", output: "1", explanation: "Mock example" }
        ],
        functionMetadata: { functionName: "solve", returnType: "void", parameters: "n" },
        aiLogs: { mock: true }
      };
    }

    const prompt = `
      You are an expert competitive programming problem setter.
      Problem: ${problem.title}
      Description:
      ${problem.statementHtml}
      
      Your task is to generate TWO Python 3 scripts to be used internally for an online judge.
      1. A "generator.py" script that generates ~100 rigorous test case inputs (including edge cases, min/max, random). It must print the inputs to STDOUT. The inputs must be correctly formatted to be passed to the reference solution. Ensure it prints a delimiter '---TEST---' between each testcase.
      2. A "reference.py" script that reads those inputs from STDIN and prints the expected output.
      
      Also extract:
      - Clean visible examples (input, output, explanation)
      - Function metadata (name, return type, parameters)
      
      Return ONLY valid JSON with this exact schema:
      {
        "generatorCode": "import sys...",
        "referenceSolutionCode": "import sys...",
        "refinedExamples": [{ "input": "...", "output": "...", "explanation": "..." }],
        "functionMetadata": { "functionName": "...", "returnType": "...", "parameters": "..." }
      }
      Do NOT wrap in markdown block. Return raw JSON string.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      // clean markdown just in case
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(text);
      return {
        generatorCode: parsed.generatorCode,
        referenceSolutionCode: parsed.referenceSolutionCode,
        refinedExamples: parsed.refinedExamples || [],
        functionMetadata: parsed.functionMetadata || { functionName: '', returnType: '', parameters: '' },
        aiLogs: { promptTokenCount: 0, responseText: text } // mock tokens for now
      };
    } catch (e: any) {
      throw new Error(`AI Generation failed: ${e.message}`);
    }
  }
}
