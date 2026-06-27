import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Problem } from '../modules/problems/problem.model.js';
import { ProblemTestSuite } from '../modules/problems/problemTestSuite.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codearena';

// Standard Boilerplates for Codeforces Style
const cppStarter = `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Write your solution here
    return 0;
}`;

const javaStarter = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
    }
}`;

const pyStarter = `import sys

def solve():
    # Write your solution here
    pass

if __name__ == '__main__':
    solve()`;

const generateStarterCodes = () => [
  { language: 'CPP', version: '*', code: cppStarter },
  { language: 'JAVA', version: '*', code: javaStarter },
  { language: 'PYTHON', version: '*', code: pyStarter },
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Optional: Clear existing problems if you want a fresh start
    // await Problem.deleteMany({});
    // await ProblemTestSuite.deleteMany({});
    
    const dummyUserId = new mongoose.Types.ObjectId();

    // 1. Two Sum
    const twoSumData = {
      title: 'Two Sum',
      slug: 'two-sum',
      description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.
You can return the answer in any order.

**Input Format:**
The first line contains an integer \`n\`, the number of elements in the array.
The second line contains \`n\` space-separated integers representing the array \`nums\`.
The third line contains an integer \`target\`.

**Output Format:**
Print two space-separated integers, the indices of the two numbers.`,
      statementHtml: 'See description',
      difficulty: 'EASY',
      tags: ['Array', 'Hash Table'],
      constraints: [
        '2 <= n <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.'
      ],
      examples: [
        { input: '4\n2 7 11 15\n9', output: '0 1', explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.' },
        { input: '3\n3 2 4\n6', output: '1 2', explanation: '' },
        { input: '2\n3 3\n6', output: '0 1', explanation: '' }
      ],
      starterCodes: generateStarterCodes(),
      source: 'ORIGINAL',
      status: 'PUBLISHED',
      createdBy: dummyUserId
    };

    const tsCasesTwoSum = [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '2\n3 3\n6', expectedOutput: '0 1', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '4\n0 4 3 0\n0', expectedOutput: '0 3', weight: 1, isEdgeCase: true, group: 'hidden' },
      { input: '5\n-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4', weight: 1, isEdgeCase: true, group: 'hidden' }
    ];

    // 2. Container With Most Water
    const containerData = {
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`ith\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.
Return the maximum amount of water a container can store.

**Input Format:**
The first line contains an integer \`n\`, the number of elements in the array.
The second line contains \`n\` space-separated integers representing the array \`height\`.

**Output Format:**
Print a single integer, the maximum amount of water.`,
      statementHtml: 'See description',
      difficulty: 'MEDIUM',
      tags: ['Array', 'Two Pointers'],
      constraints: [
        '2 <= n <= 10^5',
        '0 <= height[i] <= 10^4'
      ],
      examples: [
        { input: '9\n1 8 6 2 5 4 8 3 7', output: '49', explanation: 'Max area is between index 1 and 8.' },
        { input: '2\n1 1', output: '1', explanation: 'Max area is 1.' }
      ],
      starterCodes: generateStarterCodes(),
      source: 'ORIGINAL',
      status: 'PUBLISHED',
      createdBy: dummyUserId
    };

    const tsCasesContainer = [
      { input: '9\n1 8 6 2 5 4 8 3 7', expectedOutput: '49', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '2\n1 1', expectedOutput: '1', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '3\n4 3 2 1 4', expectedOutput: '16', weight: 1, isEdgeCase: true, group: 'hidden' },
      { input: '2\n1 2 1', expectedOutput: '2', weight: 1, isEdgeCase: true, group: 'hidden' }
    ];

    // 3. Add Two Numbers (Array version for CP)
    const addTwoData = {
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      description: `You are given two non-empty arrays representing two non-negative integers. The digits are stored in **reverse order**, and each of their elements contains a single digit. Add the two numbers and return the sum as an array in the same reverse order.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Input Format:**
The first line contains an integer \`n\`, the size of the first array.
The second line contains \`n\` space-separated digits.
The third line contains an integer \`m\`, the size of the second array.
The fourth line contains \`m\` space-separated digits.

**Output Format:**
Print space-separated digits representing the sum array.`,
      statementHtml: 'See description',
      difficulty: 'MEDIUM',
      tags: ['Array', 'Math'],
      constraints: [
        '1 <= n, m <= 100',
        '0 <= arr[i] <= 9'
      ],
      examples: [
        { input: '3\n2 4 3\n3\n5 6 4', output: '7 0 8', explanation: '342 + 465 = 807.' },
        { input: '1\n0\n1\n0', output: '0', explanation: '0 + 0 = 0' }
      ],
      starterCodes: generateStarterCodes(),
      source: 'ORIGINAL',
      status: 'PUBLISHED',
      createdBy: dummyUserId
    };

    const tsCasesAddTwo = [
      { input: '3\n2 4 3\n3\n5 6 4', expectedOutput: '7 0 8', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '1\n0\n1\n0', expectedOutput: '0', weight: 1, isEdgeCase: false, group: 'basic' },
      { input: '7\n9 9 9 9 9 9 9\n4\n9 9 9 9', expectedOutput: '8 9 9 9 0 0 0 1', weight: 1, isEdgeCase: true, group: 'hidden' }
    ];

    const problemsToSeed = [
      { prob: twoSumData, cases: tsCasesTwoSum },
      { prob: containerData, cases: tsCasesContainer },
      { prob: addTwoData, cases: tsCasesAddTwo }
    ];

    for (const item of problemsToSeed) {
      // Upsert Problem
      let problem = await Problem.findOne({ slug: item.prob.slug });
      if (problem) {
        Object.assign(problem, item.prob);
        problem.statementHtml = item.prob.description;
        await problem.save();
        console.log(`Updated problem: ${item.prob.title}`);
      } else {
        item.prob.statementHtml = item.prob.description;
        problem = await Problem.create(item.prob as any);
        console.log(`Created problem: ${item.prob.title}`);
      }

      // Upsert Test Suite
      let testSuite = await ProblemTestSuite.findOne({ problemId: problem._id });
      if (testSuite) {
        testSuite.cases = item.cases as any;
        await testSuite.save();
        console.log(`Updated test suite for: ${item.prob.title}`);
      } else {
        await ProblemTestSuite.create({
          problemId: problem._id,
          version: 1,
          checkerType: 'STANDARD',
          generatedAt: new Date(),
          cases: item.cases
        });
        console.log(`Created test suite for: ${item.prob.title}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
