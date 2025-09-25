import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import logger from '#config/logger.js';
import authRoutes from '#routes/auth.route.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cookieParser());

// HTTP request logging with Winston + Morgan
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

// Root route
app.get('/', (req, res) => {
  logger.info('Hello from acquisitions');
  res.status(200).json({ message: 'Hello from acquisitions' });
});

// Base API route
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Acquisitions API is running',
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler (must have 4 params)
app.use((err, req, res) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
