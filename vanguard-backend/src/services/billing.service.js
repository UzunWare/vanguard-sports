/**
 * Billing Service
 * Handles all payment, invoice, and transaction operations
 */

const db = require('../config/database');
const stripe = require('../config/stripe');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique invoice number
 */
const generateInvoiceNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}${random}`;
};

/**
 * Generate unique transaction number
 */
const generateTransactionNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TXN-${timestamp}${random}`;
};

/**
 * Create invoice for enrollment
 */
const createInvoice = async (parentId, enrollmentId, sessionData) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const invoiceNumber = generateInvoiceNumber();
    const amount = parseFloat(sessionData.price) || 0;
    const registrationFee = parseFloat(sessionData.registration_fee) || 0;
    const totalAmount = amount + registrationFee;
    const taxAmount = 0; // Can add tax calculation later

    const description = `${sessionData.sport} - ${sessionData.level} | ${sessionData.day_of_week} ${sessionData.start_time}-${sessionData.end_time}`;

    const query = `
      INSERT INTO invoices (
        invoice_number, parent_id, enrollment_id,
        amount, tax_amount, total_amount, description,
        status, due_date, invoice_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE)
      RETURNING *
    `;

    const values = [
      invoiceNumber,
      parentId,
      enrollmentId,
      totalAmount,
      taxAmount,
      totalAmount,
      description,
      'pending'
    ];

    const result = await client.query(query, values);

    await client.query('COMMIT');
    logger.info(`Invoice created: ${invoiceNumber}`);
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create invoice error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Create Stripe payment intent
 */
const createPaymentIntent = async (invoiceId, parentId) => {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Get invoice details
    const invoice = await getInvoiceById(invoiceId);

    if (invoice.parent_id !== parentId) {
      const error = new Error('Invoice does not belong to this parent');
      error.statusCode = 403;
      throw error;
    }

    if (invoice.status === 'paid') {
      const error = new Error('Invoice is already paid');
      error.statusCode = 400;
      throw error;
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.total_amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        invoice_id: invoiceId,
        parent_id: parentId,
        invoice_number: invoice.invoice_number,
      },
      description: invoice.description,
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for invoice ${invoice.invoice_number}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: invoice.total_amount,
    };
  } catch (error) {
    logger.error('Create payment intent error:', error.message);
    throw error;
  }
};

/**
 * Process payment and create transaction record
 */
const processPayment = async (paymentIntentId, invoiceId, parentId) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Verify payment intent with Stripe
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      const error = new Error('Payment has not succeeded');
      error.statusCode = 400;
      throw error;
    }

    // Get invoice
    const invoice = await getInvoiceById(invoiceId);

    if (invoice.status === 'paid') {
      // Already marked as paid, return existing transaction
      const existingTxn = await client.query(
        'SELECT * FROM transactions WHERE invoice_id = $1 AND status = $2',
        [invoiceId, 'succeeded']
      );

      if (existingTxn.rows.length > 0) {
        await client.query('COMMIT');
        return existingTxn.rows[0];
      }
    }

    // Create transaction record
    const transactionNumber = generateTransactionNumber();
    const transactionQuery = `
      INSERT INTO transactions (
        transaction_number, invoice_id, parent_id,
        amount, stripe_payment_intent_id,
        status, processed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const transactionResult = await client.query(transactionQuery, [
      transactionNumber,
      invoiceId,
      parentId,
      invoice.total_amount,
      paymentIntentId,
      'succeeded'
    ]);

    // Update invoice status
    await client.query(
      `UPDATE invoices SET status = $1, paid_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ['paid', invoiceId]
    );

    await client.query('COMMIT');
    logger.info(`Payment processed: ${transactionNumber} for invoice ${invoice.invoice_number}`);

    return transactionResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Process payment error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (invoiceId) => {
  try {
    const query = 'SELECT * FROM invoices WHERE id = $1';
    const result = await db.query(query, [invoiceId]);

    if (result.rows.length === 0) {
      const error = new Error('Invoice not found');
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get invoice error:', error.message);
    throw error;
  }
};

/**
 * Get all invoices for a parent
 */
const getParentInvoices = async (parentId) => {
  try {
    const query = `
      SELECT
        i.*,
        e.athlete_id,
        a.first_name || ' ' || a.last_name as athlete_name,
        s.sport,
        s.level
      FROM invoices i
      LEFT JOIN enrollments e ON i.enrollment_id = e.id
      LEFT JOIN athletes a ON e.athlete_id = a.id
      LEFT JOIN sessions s ON e.session_id = s.id
      WHERE i.parent_id = $1
      ORDER BY i.created_at DESC
    `;

    const result = await db.query(query, [parentId]);
    return result.rows;
  } catch (error) {
    logger.error('Get parent invoices error:', error.message);
    throw error;
  }
};

/**
 * Get all transactions for a parent
 */
const getParentTransactions = async (parentId) => {
  try {
    const query = `
      SELECT
        t.*,
        i.invoice_number,
        i.description,
        pm.card_brand,
        pm.card_last4
      FROM transactions t
      INNER JOIN invoices i ON t.invoice_id = i.id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.parent_id = $1
      ORDER BY t.created_at DESC
    `;

    const result = await db.query(query, [parentId]);
    return result.rows;
  } catch (error) {
    logger.error('Get parent transactions error:', error.message);
    throw error;
  }
};

/**
 * Get all transactions (admin only)
 */
const getAllTransactions = async (filters = {}) => {
  try {
    let query = `
      SELECT
        t.*,
        i.invoice_number,
        i.description,
        u.first_name || ' ' || u.last_name as parent_name,
        u.email as parent_email,
        pm.card_brand,
        pm.card_last4
      FROM transactions t
      INNER JOIN invoices i ON t.invoice_id = i.id
      INNER JOIN users u ON t.parent_id = u.id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    // Apply filters
    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND t.created_at >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND t.created_at <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    if (filters.searchQuery) {
      query += ` AND (
        i.invoice_number ILIKE $${paramCount} OR
        t.transaction_number ILIKE $${paramCount} OR
        u.first_name ILIKE $${paramCount} OR
        u.last_name ILIKE $${paramCount} OR
        u.email ILIKE $${paramCount} OR
        i.description ILIKE $${paramCount}
      )`;
      params.push(`%${filters.searchQuery}%`);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC`;

    // Apply limit
    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Get all transactions error:', error.message);
    throw error;
  }
};

/**
 * Process refund
 */
const refundTransaction = async (transactionId, amount = null, reason = 'requested_by_customer') => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    // Get transaction
    const txnQuery = 'SELECT * FROM transactions WHERE id = $1';
    const txnResult = await client.query(txnQuery, [transactionId]);

    if (txnResult.rows.length === 0) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    const transaction = txnResult.rows[0];

    if (transaction.status === 'refunded') {
      const error = new Error('Transaction is already refunded');
      error.statusCode = 400;
      throw error;
    }

    // Create refund in Stripe
    const refundAmount = amount ? Math.round(amount * 100) : null;
    const refund = await stripe.refunds.create({
      payment_intent: transaction.stripe_payment_intent_id,
      amount: refundAmount, // null means full refund
      reason: reason,
    });

    // Update transaction status
    await client.query(
      `UPDATE transactions SET status = $1 WHERE id = $2`,
      ['refunded', transactionId]
    );

    // Update invoice status
    await client.query(
      `UPDATE invoices SET status = $1 WHERE id = $2`,
      ['refunded', transaction.invoice_id]
    );

    await client.query('COMMIT');
    logger.info(`Refund processed: ${refund.id} for transaction ${transaction.transaction_number}`);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Refund transaction error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createInvoice,
  createPaymentIntent,
  processPayment,
  getInvoiceById,
  getParentInvoices,
  getParentTransactions,
  getAllTransactions,
  refundTransaction,
};
