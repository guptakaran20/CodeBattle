import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from '../modules/problems/problem.model.js';
import { ProblemTestSuite } from '../modules/problems/problemTestSuite.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';

const fixTestcases = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    const problem = await Problem.findOne({ slug: 'two-sum' });
    if (!problem) {
      console.log('Two Sum problem not found.');
      process.exit(1);
    }

    const testSuite = await ProblemTestSuite.findOne({ problemId: problem._id, version: problem.versions.testSuiteVersion });
    
    if (!testSuite) {
      console.log('Test suite not found. Creating one...');
      await ProblemTestSuite.create({
        problemId: problem._id,
        version: problem.versions.testSuiteVersion,
        checkerType: 'STANDARD',
        generatedAt: new Date(),
        cases: [
          {
            input: 'nums = [2,7,11,15]\n9',
            expectedOutput: '[0,1]',
            weight: 1,
            isEdgeCase: false,
            group: 'basic'
          },
          {
            input: 'nums = [3,2,4]\n6',
            expectedOutput: '[1,2]',
            weight: 1,
            isEdgeCase: false,
            group: 'basic'
          },
          {
            input: 'nums = [3,3]\n6',
            expectedOutput: '[0,1]',
            weight: 1,
            isEdgeCase: false,
            group: 'basic'
          }
        ]
      });
      console.log('Successfully created test suite for Two Sum.');
    } else {
      console.log('Test suite already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixTestcases();
