require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

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

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
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

app.use('/api/', limiter);

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
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/athletes', require('./routes/athlete.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));
app.use('/api/evaluations', require('./routes/evaluation.routes'));
// app.use('/api/billing', require('./routes/billing.routes'));
// app.use('/api/admin', require('./routes/admin.routes'));

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
