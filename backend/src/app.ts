import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { generalLimiter } from './middleware/security';
import { errorHandler } from './middleware/errorHandler';

import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './modules/users/user.router';
import { moodRouter } from './modules/mood/mood.router';
import { journalRouter } from './modules/journal/journal.router';
import { chatRouter } from './modules/ai-chat/chat.router';
import { notificationRouter } from './modules/notifications/notification.router';
import { resourcesRouter } from './modules/resources/resources.router';
import { privacyRouter } from './modules/privacy/privacy.router';

const app = express();

// Trust proxy for rate limiting on Vercel / reverse proxies
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Managed by Vercel/Vite in production
  crossOriginEmbedderPolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev, or specify strict origins
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Parsers
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Strict Anti-Caching for Sensitive Health & Auth API Endpoints (DPDP Act 2023 Compliance)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Health check endpoint (exempt from rate limit for monitoring & probes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'MindEase CBT & Mental Health API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// General Rate Limiter
app.use('/api/', generalLimiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/mood', moodRouter);
app.use('/api/journal', journalRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/privacy', privacyRouter);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found.` }
  });
});

// Global Error Handler
app.use(errorHandler);

export { app };
