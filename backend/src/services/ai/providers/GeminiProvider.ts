import { GoogleGenerativeAI } from '@google/generative-ai';
import type { IAIProvider, CodeReviewResult, GeneratedProblem } from '../IAIProvider.js';

export class GeminiProvider implements IAIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY environment variable is missing.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
  }

  async generateCodeReview(submissionCode: string, language: string, problemDescription: string): Promise<CodeReviewResult> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY is missing. Returning a mock code review.');
      return {
        timeComplexity: "O(n)",
        spaceComplexity: "O(n)",
        missedEdgeCases: ["Handling empty inputs", "Extremely large inputs"],
        bestPracticesScore: 85,
        markdownCritique: "### Mock Code Review\n\nYour code looks generally good! Since you haven't configured a Gemini API key yet, this is a mock review.\n\n- **Strengths:** Good variable naming and logical flow.\n- **Suggestions:** Consider optimizing the inner loop."
      };
    }

    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });
    
    const prompt = `You are an expert software engineer. Review the following ${language} code submitted for this problem:
    Problem: ${problemDescription}
    Code:
    \`\`\`
    ${submissionCode}
    \`\`\`
    
    Analyze the code and return a JSON object with this exact structure:
    {
      "timeComplexity": "Big O notation",
      "spaceComplexity": "Big O notation",
      "missedEdgeCases": ["edge case 1", "edge case 2"],
      "bestPracticesScore": a number out of 100,
      "markdownCritique": "A beautifully formatted markdown string explaining your review."
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(text) as CodeReviewResult;
    } catch (e) {
      console.error('Failed to parse Gemini code review response:', e);
      console.error('Raw text:', text);
      throw new Error('Failed to parse AI response');
    }
  }

  async generateSimilarProblem(topicOrBaseProblem: string): Promise<GeneratedProblem> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY is missing. Returning a mock similar problem.');
      return {
        title: `Variant of ${topicOrBaseProblem}`,
        description: `This is a dynamically generated mock variant of **${topicOrBaseProblem}**.\n\nGiven an array of integers \`nums\` and an integer \`target\`, find the number of pairs that sum up to \`target\`.\n\n**Constraints:**\n- \`1 <= nums.length <= 10^5\`\n- \`-10^9 <= nums[i] <= 10^9\``,
        examples: [
          { input: "nums = [1, 2, 3, 4], target = 5", output: "2", explanation: "1+4=5 and 2+3=5" }
        ],
        starterCode: {
          CPP: "class Solution {\npublic:\n    int findPairs(vector<int>& nums, int target) {\n        return 0;\n    }\n};",
          JAVA: "class Solution {\n    public int findPairs(int[] nums, int target) {\n        return 0;\n    }\n}",
          PYTHON: "class Solution:\n    def findPairs(self, nums, target):\n        return 0"
        },
        testcases: [
          { input: "1 2 3 4\n5", expectedOutput: "2", isHidden: false },
          { input: "1 1 1\n2", expectedOutput: "3", isHidden: true }
        ],
        difficulty: "MEDIUM"
      };
    }

    const model = this.genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: { responseMimeType: 'application/json' } 
    });

    const prompt = `You are an expert algorithm problem setter. Generate a high-quality competitive programming problem based on this topic or base problem: "${topicOrBaseProblem}".
    
    Return a JSON object with this exact structure:
    {
      "title": "String",
      "description": "String (Markdown formatted problem description)",
      "examples": [
        { "input": "String", "output": "String", "explanation": "String (optional)" }
      ],
      "starterCode": {
        "CPP": "String",
        "JAVA": "String",
        "PYTHON": "String"
      },
      "testcases": [
        { "input": "String", "expectedOutput": "String", "isHidden": boolean }
      ],
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
    
    Ensure test cases are perfectly accurate and edge cases are covered. Provide exactly 3 to 5 test cases.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      return JSON.parse(text) as GeneratedProblem;
    } catch (e) {
      console.error('Failed to parse Gemini generated problem response:', e);
      console.error('Raw text:', text);
      throw new Error('Failed to parse AI response');
    }
  }
}
