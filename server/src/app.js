import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { config } from './config/env.js';
import { isDBReady } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Ensure all models are registered with Mongoose
import './models/User.js';
import './models/Department.js';
import './models/Contractor.js';
import './models/RoadSegment.js';
import './models/Project.js';
import './models/ProjectUpdate.js';
import './models/Report.js';
import './models/ConflictDecision.js';
import './models/ActivityEvent.js';
import './models/IdempotencyRecord.js';
import './models/Media.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import conflictRoutes from './routes/conflictRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import referenceRoutes from './routes/referenceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Trust proxy for secure cookies on Render / reverse proxy
app.set('trust proxy', 1);

// Standard Middlewares
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health Check Endpoints
app.get('/health/live', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', (req, res) => {
  const ready = isDBReady();
  if (ready) {
    return res.json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  }
  return res.status(503).json({
    status: 'not_ready',
    database: 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// REST API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/conflicts', conflictRoutes);
app.use('/api/v1/insights', insightRoutes);
app.use('/api/v1/media', mediaRoutes);
app.use('/api/v1/reference-data', referenceRoutes);

// Explicit 404 for unknown /api/* requests so they never return HTML SPA fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Serve built frontend assets in production / single-service deployment
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // SPA fallback for non-API routes
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api/') || req.originalUrl.startsWith('/health/')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);
