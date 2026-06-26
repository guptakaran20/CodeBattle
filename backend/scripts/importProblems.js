import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProblemImporterService } from '../src/services/importer/ProblemImporterService.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
async function run() {
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is not set in environment variables');
        process.exit(1);
    }
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. The AI generation step will fail.');
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const importer = new ProblemImporterService();
        console.log('Starting import pipeline...');
        // We aim for 1 of each for quick testing
        await importer.runImport(1, 1, 1);
        console.log('Import completed successfully.');
    }
    catch (error) {
        console.error('Error during import:', error);
    }
    finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}
run();
//# sourceMappingURL=importProblems.js.map