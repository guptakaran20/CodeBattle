export class ProblemParser {
    baseUrl = 'https://alfa-leetcode-api.onrender.com';
    async fetchProblemList(limit = 150) {
        const response = await fetch(`${this.baseUrl}/problems?limit=${limit}`);
        const data = await response.json();
        return data.problemsetQuestionList || [];
    }
    async fetchProblemDetails(titleSlug) {
        const response = await fetch(`${this.baseUrl}/select?titleSlug=${titleSlug}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch problem details for ${titleSlug}`);
        }
        const data = await response.json();
        // Some basic normalizations
        const tags = data.topicTags?.map((t) => t.name) || [];
        const companies = data.companyTagStats ? Object.keys(data.companyTagStats).map((k) => k) : [];
        // Starter codes would typically come from a different endpoint in alfa API 
        // or sometimes it's returned as codeSnippets. We'll handle it if it exists.
        let starterCodes = [];
        if (data.codeSnippets) {
            starterCodes = data.codeSnippets.map((snippet) => ({
                language: snippet.langSlug,
                version: 'default',
                code: snippet.code,
            }));
        }
        return {
            leetcodeId: data.questionId,
            title: data.questionTitle,
            slug: data.titleSlug,
            difficulty: data.difficulty?.toUpperCase(),
            statementHtml: data.question || '',
            tags,
            companies,
            examples: this.extractExamples(data.exampleTestcases, data.question),
            constraints: this.extractConstraints(data.question),
            starterCodes,
            rawSource: data,
        };
    }
    extractExamples(testcases, html) {
        // Basic extraction, ideally we can extract precisely from the HTML or use Gemini for this part later
        // but the task specifies examples as part of ParsedProblemData. We will let AI handle edge cases.
        if (!testcases)
            return [];
        const lines = testcases.split('\n').filter(Boolean);
        // Simple naive parsing for visible testcases
        return lines.map(line => ({
            input: line,
            output: 'TODO', // Expected output is not always easily available without running the solution
            explanation: ''
        }));
    }
    extractConstraints(html) {
        // Rough extraction from HTML
        const constraintsMatch = html?.match(/<ul>(.*?)<\/ul>/is);
        if (constraintsMatch && constraintsMatch[1]) {
            const items = constraintsMatch[1].match(/<li>(.*?)<\/li>/gi);
            if (items) {
                return items.map(item => item.replace(/<\/?li>/g, '').replace(/<[^>]+>/g, '').trim());
            }
        }
        return [];
    }
}
//# sourceMappingURL=ProblemParser.js.map