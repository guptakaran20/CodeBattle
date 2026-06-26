import axios from 'axios';
const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:2358';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';
export const LANGUAGE_MAPPING = {
    CPP: 54,
    JAVA: 62,
    PYTHON: 71
};
export class Judge0Service {
    static async submitBatch(submissions, webhookUrl) {
        const payload = {
            submissions: submissions.map(sub => ({
                ...sub,
                callback_url: webhookUrl
            }))
        };
        const headers = { 'Content-Type': 'application/json' };
        if (JUDGE0_API_KEY) {
            headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        }
        // Using wait=false to support both polling and webhooks
        const response = await axios.post(`${JUDGE0_URL}/submissions/batch?base64_encoded=false`, payload, { headers });
        return response.data.map((item) => item.token);
    }
    static async getBatchResults(tokens) {
        const headers = {};
        if (JUDGE0_API_KEY) {
            headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
        }
        const tokensStr = tokens.join(',');
        const response = await axios.get(`${JUDGE0_URL}/submissions/batch?tokens=${tokensStr}&base64_encoded=false`, { headers });
        return response.data.submissions;
    }
}
//# sourceMappingURL=judge0.service.js.map