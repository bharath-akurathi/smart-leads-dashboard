import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import leadRoutes from './routes/lead.routes';
import errorHandler from './middleware/errorHandler';
import connectDB from './config/db';

const app = express();

// ─── SERVERLESS DATABASE MIDDLEWARE ────────────────────────────────────
// This guarantees MongoDB is ready before handling any routing.
// It catches connection failures safely without crashing the Vercel container.
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error); 
  }
});

// ─── DYNAMIC CORS CONFIGURATION ────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174' // Added fallback local port based on your README
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      
      // Allow requests that match the allowed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      
      // If it doesn't match, block it
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Included PATCH from your original routes
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Explicitly handle preflight for all routes
app.options('*', cors());

// ─── SECURITY & PARSING MIDDLEWARE ─────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── ROUTES ────────────────────────────────────────────────────────────
// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Centralized error handler
app.use(errorHandler);

export default app;
