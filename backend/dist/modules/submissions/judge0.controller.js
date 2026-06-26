import { evaluateSubmissionResult } from './submission.evaluator.js';
import { Submission } from './submission.model.js';
import { Judge0Service } from './judge0.service.js';
export const judge0Webhook = async (req, res, next) => {
    try {
        const payload = req.body;
        const token = payload.token;
        if (!token) {
            return res.status(400).json({ success: false, message: 'Missing token' });
        }
        // Find the submission containing this token
        const submission = await Submission.findOne({ judge0Token: new RegExp(token) });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        // Since webhook only gives us the result of one token, and we submitted a batch, 
        // it's safer to just fetch the full batch results to calculate the final verdict,
        // rather than trying to construct it piece by piece.
        const tokens = submission.judge0Token?.split(',') || [];
        const results = await Judge0Service.getBatchResults(tokens);
        const isFinished = results.every((r) => r.status && r.status.id !== 1 && r.status.id !== 2);
        if (isFinished) {
            await evaluateSubmissionResult(submission._id.toString(), results);
        }
        return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=judge0.controller.js.map