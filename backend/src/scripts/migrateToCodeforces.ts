import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from '../modules/problems/problem.model.js';
import { ProblemTestSuite } from '../modules/problems/problemTestSuite.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    const problem = await Problem.findOne({ slug: 'two-sum' });
    if (!problem) {
      console.log('Problem not found');
      process.exit(1);
    }

    // Update examples to Codeforces style
    problem.examples = [
      {
        input: '4\n2 7 11 15\n9',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.'
      },
      {
        input: '3\n3 2 4\n6',
        output: '1 2',
        explanation: ''
      },
      {
        input: '2\n3 3\n6',
        output: '0 1',
        explanation: ''
      }
    ];

    // Some places use starterCode as a loose object, others use starterCodes. Let's update both.
    const cppStarter = '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}';
    const javaStarter = 'import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}';
    const pyStarter = 'def solve():\n    # Write your solution here\n    pass\n\nif __name__ == "__main__":\n    solve()';

    // Must use set() to update a Schema.Types.Mixed properly if it is not typed strictly
    problem.set('starterCode', {
      CPP: cppStarter,
      JAVA: javaStarter,
      PYTHON: pyStarter
    });
    
    problem.starterCodes = [
      { language: 'CPP', version: '*', code: cppStarter },
      { language: 'JAVA', version: '*', code: javaStarter },
      { language: 'PYTHON', version: '*', code: pyStarter },
    ];

    const desc = `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
You can return the answer in any order.

**Input Format:**
The first line contains an integer \`n\`, the number of elements in the array.
The second line contains \`n\` space-separated integers representing the array \`nums\`.
The third line contains an integer \`target\`.

**Output Format:**
Print two space-separated integers, the indices of the two numbers.`;

    (problem as any).description = desc;
    problem.statementHtml = desc;

    await problem.save();
    console.log('Updated Problem Model');

    // Update test suite
    const testSuite = await ProblemTestSuite.findOne({ problemId: problem._id });
    if (testSuite) {
      testSuite.cases = [
        {
          input: '4\n2 7 11 15\n9',
          expectedOutput: '0 1',
          weight: 1,
          isEdgeCase: false,
          group: 'basic'
        },
        {
          input: '3\n3 2 4\n6',
          expectedOutput: '1 2',
          weight: 1,
          isEdgeCase: false,
          group: 'basic'
        },
        {
          input: '2\n3 3\n6',
          expectedOutput: '0 1',
          weight: 1,
          isEdgeCase: false,
          group: 'basic'
        }
      ];
      await testSuite.save();
      console.log('Updated Test Suite');
    }

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

run();
