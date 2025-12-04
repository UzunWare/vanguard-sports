/**
 * Billing Controller
 * Handles HTTP requests for billing and payment operations
 */

const billingService = require('../services/billing.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Create payment intent for an invoice
 * POST /api/billing/create-payment-intent
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invoice ID is required',
        },
      });
    }

    const paymentIntent = await billingService.createPaymentIntent(invoiceId, req.user.id);

    res.status(200).json({
      message: 'Payment intent created',
      paymentIntent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm payment after Stripe processes it
 * POST /api/billing/confirm-payment
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, invoiceId } = req.body;

    if (!paymentIntentId || !invoiceId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Payment intent ID and invoice ID are required',
        },
      });
    }

    const transaction = await billingService.processPayment(
      paymentIntentId,
      invoiceId,
      req.user.id
    );

    // Send payment receipt email (in background)
    (async () => {
      try {
        const invoice = await billingService.getInvoiceById(invoiceId);
        await emailService.sendPaymentReceiptEmail({
          email: req.user.email,
          parentName: `${req.user.first_name} ${req.user.last_name}`,
          transactionNumber: transaction.transaction_number,
          invoiceNumber: invoice.invoice_number,
          amount: transaction.amount,
          date: transaction.processed_at,
          description: invoice.description,
          paymentMethod: 'Credit Card', // Can be enhanced later
        });
      } catch (emailError) {
        logger.error('Failed to send payment receipt email:', emailError);
      }
    })();

    res.status(200).json({
      message: 'Payment confirmed successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invoices for current user
 * GET /api/billing/invoices
 */
const getMyInvoices = async (req, res, next) => {
  try {
    const invoices = await billingService.getParentInvoices(req.user.id);

    res.status(200).json({
      invoices,
      total: invoices.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get specific invoice by ID
 * GET /api/billing/invoices/:id
 */
const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await billingService.getInvoiceById(id);

    // Verify ownership
    if (invoice.parent_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this invoice',
        },
      });
    }

    res.status(200).json({
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions for current user
 * GET /api/billing/transactions
 */
const getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await billingService.getParentTransactions(req.user.id);

    res.status(200).json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions (admin only)
 * GET /api/billing/admin/transactions
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      searchQuery: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : null,
    };

    const transactions = await billingService.getAllTransactions(filters);

    res.status(200).json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund (admin only)
 * POST /api/billing/admin/refund
 */
const processRefund = async (req, res, next) => {
  try {
    const { transactionId, amount, reason } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Transaction ID is required',
        },
      });
    }

    const refund = await billingService.refundTransaction(transactionId, amount, reason);

    // Send refund confirmation email (in background)
    (async () => {
      try {
        // Get transaction details
        const transactions = await billingService.getAllTransactions({ limit: 1 });
        const transaction = transactions.find(t => t.id === transactionId);

        if (transaction) {
          await emailService.sendRefundEmail({
            email: transaction.parent_email,
            parentName: transaction.parent_name,
            transactionNumber: transaction.transaction_number,
            refundAmount: refund.amount,
            originalAmount: transaction.amount,
            reason: reason || 'Your refund request has been processed',
          });
        }
      } catch (emailError) {
        logger.error('Failed to send refund email:', emailError);
      }
    })();

    res.status(200).json({
      message: 'Refund processed successfully',
      refund,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  getMyInvoices,
  getInvoiceById,
  getMyTransactions,
  getAllTransactions,
  processRefund,
};
