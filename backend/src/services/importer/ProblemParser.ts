export interface ParsedProblemData {
  leetcodeId: string;
  title: string;
  slug: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  statementHtml: string;
  tags: string[];
  companies: string[];
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  starterCodes: { language: string; version: string; code: string }[];
  rawSource: any;
}

export class ProblemParser {
  private baseUrl = 'https://alfa-leetcode-api.onrender.com';

  async fetchProblemList(limit: number = 150): Promise<{ titleSlug: string, difficulty: string }[]> {
    const response = await fetch(`${this.baseUrl}/problems?limit=${limit}`);
    const data = await response.json();
    return data.problemsetQuestionList || [];
  }

  async fetchProblemDetails(titleSlug: string): Promise<ParsedProblemData> {
    const response = await fetch(`${this.baseUrl}/select?titleSlug=${titleSlug}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch problem details for ${titleSlug}`);
    }
    const data = await response.json();
    
    // Some basic normalizations
    const tags = data.topicTags?.map((t: any) => t.name) || [];
    const companies = data.companyTagStats ? Object.keys(data.companyTagStats).map((k: string) => k) : [];
    
    // Starter codes would typically come from a different endpoint in alfa API 
    // or sometimes it's returned as codeSnippets. We'll handle it if it exists.
    let starterCodes = [];
    if (data.codeSnippets) {
      starterCodes = data.codeSnippets.map((snippet: any) => ({
        language: snippet.langSlug,
        version: 'default',
        code: snippet.code,
      }));
    }

    return {
      leetcodeId: data.questionId,
      title: data.questionTitle,
      slug: data.titleSlug,
      difficulty: data.difficulty?.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD',
      statementHtml: data.question || '',
      tags,
      companies,
      examples: this.extractExamples(data.exampleTestcases, data.question),
      constraints: this.extractConstraints(data.question),
      starterCodes,
      rawSource: data,
    };
  }

  private extractExamples(testcases: string, html: string): any[] {
    // Basic extraction, ideally we can extract precisely from the HTML or use Gemini for this part later
    // but the task specifies examples as part of ParsedProblemData. We will let AI handle edge cases.
    if (!testcases) return [];
    
    const lines = testcases.split('\n').filter(Boolean);
    // Simple naive parsing for visible testcases
    return lines.map(line => ({
      input: line,
      output: 'TODO', // Expected output is not always easily available without running the solution
      explanation: ''
    }));
  }

  private extractConstraints(html: string): string[] {
    // Rough extraction from HTML
    const constraintsMatch = html?.match(/<ul>(.*?)<\/ul>/is);
    if (constraintsMatch) {
      const items = constraintsMatch[1].match(/<li>(.*?)<\/li>/gi);
      if (items) {
        return items.map(item => item.replace(/<\/?li>/g, '').replace(/<[^>]+>/g, '').trim());
      }
    }
    return [];
  }
}
