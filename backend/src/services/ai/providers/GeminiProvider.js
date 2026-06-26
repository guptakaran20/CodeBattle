import { GoogleGenerativeAI } from '@google/generative-ai';
export class GeminiProvider {
    genAI;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ GEMINI_API_KEY environment variable is missing.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
    }
    async generateCodeReview(submissionCode, language, problemDescription) {
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
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
        const text = response.text();
        return JSON.parse(text);
    }
    async generateSimilarProblem(topicOrBaseProblem) {
        const model = this.genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
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
    
    Ensure test cases are perfectly accurate and edge cases are covered.`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return JSON.parse(text);
    }
}
//# sourceMappingURL=GeminiProvider.js.map