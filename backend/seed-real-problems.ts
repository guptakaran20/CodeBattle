import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Problem } from './src/modules/problems/problem.model.js';
import { ProblemTestSuite } from './src/modules/problems/problemTestSuite.model.js';
import { User } from './src/modules/users/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const problemsData = [
  {
    title: 'Add Two Numbers',
    slug: 'add-two-numbers',
    difficulty: 'MEDIUM',
    statementHtml: '<p>You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.</p>',
    tags: ['Linked List', 'Math'],
    companies: ['Amazon', 'Microsoft', 'Apple'],
    examples: [{ input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807.' }],
    starterCodes: [
      { language: 'python', version: '3', code: 'class Solution:\n    def addTwoNumbers(self, l1, l2):\n        pass' },
      { language: 'cpp', version: '17', code: 'class Solution {\npublic:\n    ListNode* addTwoNumbers(ListNode* l1, ListNode* l2) {\n        return nullptr;\n    }\n};' }
    ],
    functionMetadata: { functionName: 'addTwoNumbers', returnType: 'ListNode', parameters: 'l1, l2' },
  },
  {
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    difficulty: 'HARD',
    statementHtml: '<p>Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.</p>',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    companies: ['Google', 'Amazon', 'Apple'],
    examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000', explanation: 'merged array = [1,2,3] and median is 2.' }],
    starterCodes: [
      { language: 'python', version: '3', code: 'class Solution:\n    def findMedianSortedArrays(self, nums1, nums2):\n        pass' },
      { language: 'cpp', version: '17', code: 'class Solution {\npublic:\n    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {\n        return 0.0;\n    }\n};' }
    ],
    functionMetadata: { functionName: 'findMedianSortedArrays', returnType: 'double', parameters: 'nums1, nums2' },
  },
  {
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'MEDIUM',
    statementHtml: '<p>You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.</p>',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    companies: ['Amazon', 'Adobe', 'Google'],
    examples: [{ input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.' }],
    starterCodes: [
      { language: 'python', version: '3', code: 'class Solution:\n    def maxArea(self, height):\n        pass' },
      { language: 'cpp', version: '17', code: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0;\n    }\n};' }
    ],
    functionMetadata: { functionName: 'maxArea', returnType: 'int', parameters: 'height' },
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected to DB');

  const adminUser = await User.findOne({ username: 'guptakaran' }) || await User.findOne();

  for (const data of problemsData) {
    const existing = await Problem.findOne({ slug: data.slug });
    if (!existing) {
      const p = await Problem.create({
        ...(data as any),
        execution: { timeLimit: 2, memoryLimit: 256 },
        battle: { enabled: true, weight: 50 },
        contest: { visible: true },
        versions: { problemVersion: 1, testSuiteVersion: 1 },
        status: 'PUBLISHED',
        createdBy: adminUser?._id
      }) as any;
      
      await ProblemTestSuite.create({
        problemId: p._id,
        version: 1,
        checkerType: 'STANDARD',
        generatedAt: new Date(),
        cases: [{ input: 'mock', expectedOutput: 'mock', weight: 1, isEdgeCase: false, group: 'basic' }]
      });
      console.log(`Created ${data.title}`);
    } else {
      console.log(`${data.title} already exists.`);
    }
  }

  process.exit(0);
}

run().catch(console.error);
