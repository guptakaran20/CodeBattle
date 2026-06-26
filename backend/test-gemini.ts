import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello!");
    console.log(result.response.text());
  } catch (err: any) {
    console.error("1.5-flash error:", err.message);
  }
  try {
    const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const result = await model2.generateContent("Hello!");
    console.log(result.response.text());
  } catch (err: any) {
    console.error("1.5-flash-latest error:", err.message);
  }
  try {
    const model3 = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model3.generateContent("Hello!");
    console.log(result.response.text());
  } catch (err: any) {
    console.error("gemini-pro error:", err.message);
  }
}

run().catch(console.error);
