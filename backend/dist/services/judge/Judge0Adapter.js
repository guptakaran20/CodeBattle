export class Judge0Adapter {
    baseUrl = process.env.JUDGE0_URL || 'http://localhost:2358';
    apiKey = process.env.JUDGE0_API_KEY || '';
    get headers() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey) {
            headers['X-Auth-Token'] = this.apiKey;
        }
        return headers;
    }
    async execute(request) {
        const response = await fetch(`${this.baseUrl}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                source_code: request.sourceCode,
                language_id: request.languageId,
                expected_output: request.expectedOutput,
                stdin: request.stdin,
            }),
        });
        const data = await response.json();
        return {
            statusId: data.status.id,
            stdout: data.stdout,
            stderr: data.stderr,
            compileOutput: data.compile_output,
            time: data.time ? parseFloat(data.time) : null,
            memory: data.memory,
        };
    }
    async batchExecute(requests) {
        const submissions = requests.map(req => ({
            source_code: req.sourceCode,
            language_id: req.languageId,
            expected_output: req.expectedOutput,
            stdin: req.stdin,
        }));
        const response = await fetch(`${this.baseUrl}/submissions/batch?base64_encoded=false`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ submissions }),
        });
        const data = await response.json();
        const tokens = data.map((item) => item.token);
        // Polling for batch results (simplified for now)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const resultsResponse = await fetch(`${this.baseUrl}/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=false`, {
            headers: this.headers,
        });
        const resultsData = await resultsResponse.json();
        return resultsData.submissions.map((data) => ({
            statusId: data.status.id,
            stdout: data.stdout,
            stderr: data.stderr,
            compileOutput: data.compile_output,
            time: data.time ? parseFloat(data.time) : null,
            memory: data.memory,
        }));
    }
}
//# sourceMappingURL=Judge0Adapter.js.map