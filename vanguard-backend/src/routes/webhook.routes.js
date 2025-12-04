/**
 * Webhook Routes
 * Routes for handling external webhook events
 */

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

/**
 * Stripe Webhook
 * IMPORTANT: This route requires raw body for signature verification
 * It should be mounted before the JSON body parser middleware
 */
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  webhookController.handleStripeWebhook
);

module.exports = router;
