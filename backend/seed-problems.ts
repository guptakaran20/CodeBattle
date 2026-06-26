import mongoose from 'mongoose';
import { Problem } from './src/modules/problems/problem.model.js';
import { User } from './src/modules/users/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to DB');

  const adminUser = await User.findOne({ username: 'guptakaran' }) || await User.findOne();
  if (!adminUser) throw new Error('No user found');

  const difficulties = ['EASY', 'MEDIUM', 'HARD'] as const;
  
  for (const diff of difficulties) {
    const existing = await Problem.countDocuments({ difficulty: diff });
    if (existing === 0) {
      await Problem.create({
        title: `Sample ${diff} Problem`,
        slug: `sample-${diff.toLowerCase()}-problem-${Date.now()}`,
        statementHtml: `This is an auto-generated sample problem to make matchmaking work for ${diff} difficulty.`,
        difficulty: diff,
        tags: ['sample', diff.toLowerCase()],
        companies: [],
        constraints: ['1 <= n <= 1000'],
        examples: [{ input: 'x = 1', output: 'true', explanation: 'Sample' }],
        starterCodes: [
          { language: 'cpp', version: '17', code: 'class Solution {\npublic:\n    bool solve() {\n        return true;\n    }\n};' },
          { language: 'java', version: '17', code: 'class Solution {\n    public boolean solve() {\n        return true;\n    }\n}' },
          { language: 'python', version: '3', code: 'class Solution:\n    def solve(self):\n        return True\n' }
        ],
        functionMetadata: { functionName: 'solve', returnType: 'boolean', parameters: '' },
        execution: { timeLimit: 2, memoryLimit: 256 },
        battle: { enabled: true, weight: 50 },
        contest: { visible: true },
        versions: { problemVersion: 1, testSuiteVersion: 1 },
        status: 'PUBLISHED',
        createdBy: adminUser._id
      });
      console.log(`Created ${diff} problem.`);
    }
  }

  process.exit(0);
}

seed().catch(console.error);
