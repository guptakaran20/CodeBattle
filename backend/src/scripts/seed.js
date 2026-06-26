import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from '../modules/problems/problem.model.js';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';
const seedTwoSum = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        const existingProblem = await Problem.findOne({ slug: 'two-sum' });
        if (existingProblem) {
            console.log('Two Sum problem already exists in the database.');
            process.exit(0);
        }
        const dummyUserId = new mongoose.Types.ObjectId();
        const twoSumProblem = {
            title: 'Two Sum',
            slug: 'two-sum',
            description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.',
            difficulty: 'EASY',
            tags: ['Array', 'Hash Table'],
            constraints: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                '-10^9 <= target <= 10^9',
                'Only one valid answer exists.'
            ],
            examples: [
                {
                    input: 'nums = [2,7,11,15], target = 9',
                    output: '[0,1]',
                    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                },
                {
                    input: 'nums = [3,2,4], target = 6',
                    output: '[1,2]',
                    explanation: ''
                },
                {
                    input: 'nums = [3,3], target = 6',
                    output: '[0,1]',
                    explanation: ''
                }
            ],
            starterCode: {
                CPP: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};',
                JAVA: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
                PYTHON: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass'
            },
            testcases: [
                {
                    input: 'nums = [2,7,11,15], target = 9',
                    expectedOutput: '[0,1]',
                    isHidden: false
                },
                {
                    input: 'nums = [3,2,4], target = 6',
                    expectedOutput: '[1,2]',
                    isHidden: false
                },
                {
                    input: 'nums = [3,3], target = 6',
                    expectedOutput: '[0,1]',
                    isHidden: false
                }
            ],
            source: 'ORIGINAL',
            isPublished: true,
            createdBy: dummyUserId
        };
        const problem = await Problem.create(twoSumProblem);
        console.log(`Successfully added problem: ${problem.title}`);
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};
seedTwoSum();
//# sourceMappingURL=seed.js.map