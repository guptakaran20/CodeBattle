import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProblemImporterService } from '../src/services/importer/ProblemImporterService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  const titleSlug = process.argv[2];
  if (!titleSlug) {
    console.error('Please provide a titleSlug as an argument. Example: tsx scripts/syncOneProblem.ts two-sum');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const importer = new ProblemImporterService();
    console.log(`Starting import for problem: ${titleSlug}`);
    
    const success = await importer.importSingleProblem(titleSlug);

    if (success) {
      console.log('Problem imported/synced successfully.');
    } else {
      console.error('Failed to import problem. Check ImportLog for details.');
    }

  } catch (error) {
    console.error('Error during import:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

run();
