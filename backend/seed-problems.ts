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
        description: `This is an auto-generated sample problem to make matchmaking work for ${diff} difficulty.`,
        difficulty: diff,
        tags: ['sample', diff.toLowerCase()],
        constraints: ['1 <= n <= 1000'],
        examples: [{ input: 'x = 1', output: 'true', explanation: 'Sample' }],
        starterCode: {
          CPP: 'class Solution {\npublic:\n    bool solve() {\n        return true;\n    }\n};',
          JAVA: 'class Solution {\n    public boolean solve() {\n        return true;\n    }\n}',
          PYTHON: 'class Solution:\n    def solve(self):\n        return True\n'
        },
        testcases: [{ input: '1', expectedOutput: 'true', isHidden: false }],
        source: 'AI_GENERATED',
        isPublished: true,
        createdBy: adminUser._id
      });
      console.log(`Created ${diff} problem.`);
    }
  }

  process.exit(0);
}

seed().catch(console.error);
