import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';
import { globalErrorHandler } from './common/middleware/error.middleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database Connection
connectDB();

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok', message: 'Backend is healthy' } });
});

// Error Handling Middleware
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
