const { Pool } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

/**
 * PostgreSQL Database Configuration
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vanguard_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait for a connection
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  logger.error('❌ Unexpected error on idle client', { error: err.message, code: err.code });
  process.exit(-1);
});

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    // Only log query details in development - never log full SQL in production
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Query executed:', {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''), // Truncate long queries
        duration,
        rows: res.rowCount
      });
    } else {
      // In production, only log duration and row count
      logger.debug('Query executed:', { duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    // Never log full SQL query text in errors - only log metadata
    logger.error('Query execution failed:', {
      duration: Date.now() - start,
      error: error.message,
      code: error.code,
      ...(process.env.NODE_ENV === 'development' && {
        queryPreview: text.substring(0, 50) + '...'
      })
    });
    throw error;
  }
};

/**
 * Get a client from the pool (for transactions)
 * @returns {Promise<Object>} Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    logger.warn('⚠️  A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the release method to clear our timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };

  return client;
};

/**
 * Test database connection
 * @returns {Promise<boolean>} Connection status
 */
const testConnection = async () => {
  try {
    const res = await query('SELECT NOW()');
    console.log('✅ Database connection test passed:', res.rows[0].now);
    return true;
  } catch (error) {
    logger.error('❌ Database connection test failed:', { error: error.message });
    return false;
  }
};

module.exports = {
  query,
  getClient,
  pool,
  testConnection,
};
