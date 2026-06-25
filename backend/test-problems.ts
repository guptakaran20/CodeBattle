import mongoose from 'mongoose';
import { Problem } from './src/modules/problems/problem.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('Connected');
  const countE = await Problem.countDocuments({ difficulty: 'EASY' });
  const countM = await Problem.countDocuments({ difficulty: 'MEDIUM' });
  const countH = await Problem.countDocuments({ difficulty: 'HARD' });
  
  const countEasy = await Problem.countDocuments({ difficulty: 'Easy' });
  const countMedium = await Problem.countDocuments({ difficulty: 'Medium' });
  const countHard = await Problem.countDocuments({ difficulty: 'Hard' });

  console.log('UPPERCASE:', { EASY: countE, MEDIUM: countM, HARD: countH });
  console.log('Capitalized:', { Easy: countEasy, Medium: countMedium, Hard: countHard });
  process.exit(0);
}

test().catch(console.error);
