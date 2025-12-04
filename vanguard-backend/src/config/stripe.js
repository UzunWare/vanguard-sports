/**
 * Stripe Configuration
 * Initialize Stripe client for payment processing
 */

const Stripe = require('stripe');
const logger = require('../utils/logger');

// Initialize Stripe with secret key
let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16', // Use stable API version
  });
  logger.info('✅ Stripe initialized successfully');
} else {
  logger.warn('⚠️  STRIPE_SECRET_KEY not configured. Payment processing disabled.');
}

module.exports = stripe;
