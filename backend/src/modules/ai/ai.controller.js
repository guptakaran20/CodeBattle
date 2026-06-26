import { AIFactory } from '../../services/ai/AIFactory.js';
import { Submission } from '../submissions/submission.model.js';
import { Problem } from '../problems/problem.model.js';
export const generateCodeReview = async (req, res, next) => {
    try {
        const { submissionId } = req.params;
        // Fetch submission to get code and language
        const submission = await Submission.findById(submissionId).populate('problem');
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        // Only allow reviewing own code
        if (submission.user.toString() !== req.user?.id) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const problem = submission.problem; // Type assertion since it's populated
        const problemDescription = `Title: ${problem.title}\nDescription: ${problem.description}`;
        const aiProvider = AIFactory.getProvider();
        // Generate code review
        const reviewResult = await aiProvider.generateCodeReview(submission.code, submission.language, problemDescription);
        return res.status(200).json({ success: true, data: reviewResult });
    }
    catch (error) {
        console.error('AI Review Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate AI code review', error: error.message });
    }
};
export const generateSimilarProblem = async (req, res, next) => {
    try {
        const { topicOrBaseProblem } = req.body;
        if (!topicOrBaseProblem) {
            return res.status(400).json({ success: false, message: 'Missing topic or base problem description' });
        }
        const aiProvider = AIFactory.getProvider();
        // Generate new problem
        const generatedProblemData = await aiProvider.generateSimilarProblem(topicOrBaseProblem);
        // Save generated problem to DB
        // Assuming slug is generated from title
        const slug = generatedProblemData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
        const newProblem = await Problem.create({
            ...generatedProblemData,
            slug,
            source: 'AI_GENERATED',
            isPublished: true, // Immediately playable
            createdBy: req.user?.id // Set creator to the user who requested it
        });
        return res.status(201).json({ success: true, data: { problem: newProblem } });
    }
    catch (error) {
        console.error('AI Generate Problem Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate similar problem', error: error.message });
    }
};
//# sourceMappingURL=ai.controller.js.map