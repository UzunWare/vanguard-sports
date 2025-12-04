require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { doubleCsrf } = require('csrf-csrf');

const logger = require('./utils/logger');
const { testConnection } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// MIDDLEWARE
// =======================

// Security Headers
app.use(helmet());

// CORS Configuration - Require FRONTEND_URL in production
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  logger.error('❌ FRONTEND_URL environment variable is required in production');
  process.exit(1);
}

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174', // localhost only for development
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// HTTP Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication endpoints (prevent brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count all requests, even successful ones
});

// Apply strict rate limiting to auth endpoints BEFORE general limiter
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh', authLimiter);

app.use('/api/', limiter);

// =======================
// CSRF PROTECTION
// =======================

// Configure CSRF protection with double-submit cookie pattern
const {
  generateToken, // Generates a CSRF token pair
  doubleCsrfProtection, // The middleware to apply
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token', // Cookie name for CSRF token
  cookieOptions: {
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    httpOnly: true, // Prevent JavaScript access
  },
  size: 64, // Token size
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'], // Methods that don't need CSRF
});

// Endpoint to get CSRF token (must be called before submitting forms)
app.get('/api/csrf-token', (req, res) => {
  const csrfToken = generateToken(req, res);
  res.json({ csrfToken });
});

// Apply CSRF protection to all state-changing routes except webhooks
// TEMPORARY: CSRF disabled until frontend integration is complete
// TODO: Re-enable CSRF protection after frontend integration
// app.use((req, res, next) => {
//   // Skip CSRF for webhooks (they use signature verification instead)
//   if (req.path.startsWith('/api/webhooks/')) {
//     return next();
//   }
//
//   // Skip CSRF for GET, HEAD, OPTIONS requests
//   if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
//     return next();
//   }
//
//   // Apply CSRF protection to POST, PUT, PATCH, DELETE
//   return doubleCsrfProtection(req, res, next);
// });

// TEMPORARY BYPASS: Allow all requests without CSRF (remove this when ready for production)
app.use((req, res, next) => next());

// =======================
// ROUTES
// =======================

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Vanguard API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Root
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Vanguard Sports Academy API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Mount API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/athletes', require('./routes/athlete.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/evaluations', require('./routes/evaluation.routes'));
app.use('/api/contact', require('./routes/contact.routes'));
app.use('/api/billing', require('./routes/billing.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`,
    },
  });
});

// =======================
// ERROR HANDLER
// =======================

app.use((err, req, res, next) => {
  // Log error
  logger.error('❌ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'An internal server error occurred'
        : err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
});

// =======================
// START SERVER
// =======================

const startServer = async () => {
  try {
    // Test database connection
    logger.info('🔌 Testing database connection...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api`);
      logger.info(`💚 Health check: http://localhost:${PORT}/health`);
      console.log('\n===========================================');
      console.log('🏀 VANGUARD SPORTS ACADEMY API');
      console.log('===========================================');
      console.log(`✅ Server:   http://localhost:${PORT}`);
      console.log(`✅ API:      http://localhost:${PORT}/api`);
      console.log(`✅ Database: Connected`);
      console.log('===========================================\n');
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('❌ UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('❌ UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('👋 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
