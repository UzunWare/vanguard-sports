/**
 * Billing Routes
 * Routes for payment, invoice, and transaction operations
 */

const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billing.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All billing routes require authentication
router.use(authenticate);

/**
 * Parent/User Routes
 */

// Create payment intent for an invoice
router.post('/create-payment-intent', billingController.createPaymentIntent);

// Confirm payment after Stripe processes it
router.post('/confirm-payment', billingController.confirmPayment);

// Get current user's invoices
router.get('/invoices', billingController.getMyInvoices);

// Get specific invoice
router.get('/invoices/:id', billingController.getInvoiceById);

// Get current user's transactions
router.get('/transactions', billingController.getMyTransactions);

/**
 * Admin Routes
 */

// Get all transactions (admin only)
router.get(
  '/admin/transactions',
  authorize('admin'),
  billingController.getAllTransactions
);

// Process refund (admin only)
router.post(
  '/admin/refund',
  authorize('admin'),
  billingController.processRefund
);

module.exports = router;
