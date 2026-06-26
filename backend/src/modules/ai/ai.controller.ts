import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../common/types/auth.types.js';
import { AIFactory } from '../../services/ai/AIFactory.js';
import { Submission } from '../submissions/submission.model.js';
import { Problem } from '../problems/problem.model.js';

export const generateCodeReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const problem = submission.problem as any; // Type assertion since it's populated
    const problemDescription = `Title: ${problem.title}\nDescription: ${problem.description}`;

    const aiProvider = AIFactory.getProvider();
    
    // Generate code review
    const reviewResult = await aiProvider.generateCodeReview(submission.code, submission.language, problemDescription);

    return res.status(200).json({ success: true, data: reviewResult });
  } catch (error: any) {
    console.error('AI Review Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate AI code review', error: error.message });
  }
};

export const generateSimilarProblem = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
      title: generatedProblemData.title,
      slug,
      difficulty: generatedProblemData.difficulty,
      statementHtml: generatedProblemData.description,
      examples: generatedProblemData.examples,
      starterCodes: [
        { language: 'cpp', version: '17', code: generatedProblemData.starterCode?.CPP || '' },
        { language: 'java', version: '21', code: generatedProblemData.starterCode?.JAVA || '' },
        { language: 'python', version: '3', code: generatedProblemData.starterCode?.PYTHON || '' }
      ],
      functionMetadata: { functionName: 'solve', returnType: 'void', parameters: '' },
      status: 'PUBLISHED',
      execution: { timeLimit: 2, memoryLimit: 256 },
      battle: { enabled: true, weight: 50 },
      contest: { visible: true },
      versions: { problemVersion: 1, testSuiteVersion: 1 },
      createdBy: req.user?.id 
    }) as any;

    const { ProblemTestSuite } = await import('../problems/problemTestSuite.model.js');
    await ProblemTestSuite.create({
      problemId: newProblem._id,
      version: 1,
      checkerType: 'STANDARD',
      generatedAt: new Date(),
      cases: generatedProblemData.testcases.map((tc: any) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        weight: 1,
        isEdgeCase: tc.isHidden,
        group: 'ai-generated'
      }))
    });

    return res.status(201).json({ success: true, data: { problem: newProblem } });
  } catch (error: any) {
    console.error('AI Generate Problem Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate similar problem', error: error.message });
  }
};
