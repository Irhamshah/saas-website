import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler } from './middleware/errorHandler.js';
import pdfCompressRoutes from './routes/pdfCompress.js';
import imageCompressRoutes from './routes/imageCompress.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pdf', pdfCompressRoutes); // ← Add this
app.use('/api/image', imageCompressRoutes); // ← And this

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server with better error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`💡 Solutions:`);
    console.error(`   1. Kill the process: lsof -ti:${PORT} | xargs kill -9`);
    console.error(`   2. Use a different port in your .env file: PORT=5001`);
    console.error(`   3. Change the port in this file directly`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

export default app;
