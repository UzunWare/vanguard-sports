/**
 * Webhook Controller
 * Handles incoming webhooks from external services (Stripe, etc.)
 */

const stripe = require('../config/stripe');
const billingService = require('../services/billing.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Get frontend URL - fail in production if not configured
 */
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL;

  if (!url && process.env.NODE_ENV === 'production') {
    logger.error('❌ FRONTEND_URL environment variable is required in production');
    throw new Error('FRONTEND_URL not configured');
  }

  return url || 'http://localhost:5180';
};

/**
 * Handle Stripe webhook events
 * POST /api/webhooks/stripe
 */
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verify webhook signature - MUST be configured for security
    if (!webhookSecret) {
      logger.error('❌ STRIPE_WEBHOOK_SECRET not configured. Rejecting webhook for security.');
      return res.status(500).json({
        error: 'Webhook secret not configured',
        message: 'Server configuration error. Please contact system administrator.'
      });
    }

    // Verify webhook signature from Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    logger.info(`🔔 Stripe webhook received: ${event.type}`, { eventId: event.id });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;

      case 'payment_intent.created':
        logger.info(`Payment intent created: ${event.data.object.id}`);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt
    res.json({ received: true });
  } catch (err) {
    logger.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const invoiceId = paymentIntent.metadata.invoice_id;
    const parentId = paymentIntent.metadata.parent_id;

    if (!invoiceId || !parentId) {
      logger.warn('Payment intent missing metadata:', paymentIntent.id);
      return;
    }

    // Check if transaction already exists
    const existingTxn = await db.query(
      'SELECT * FROM transactions WHERE stripe_payment_intent_id = $1',
      [paymentIntent.id]
    );

    if (existingTxn.rows.length > 0) {
      logger.info(`Transaction already processed for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Process payment and create transaction
    const transaction = await billingService.processPayment(
      paymentIntent.id,
      invoiceId,
      parentId
    );

    // Get invoice and user details
    const invoice = await billingService.getInvoiceById(invoiceId);
    const userResult = await db.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [parentId]
    );

    if (userResult.rows.length === 0) {
      logger.warn(`User not found for payment: ${parentId}`);
      return;
    }

    const user = userResult.rows[0];

    // Send payment receipt email
    await emailService.sendPaymentReceiptEmail({
      email: user.email,
      parentName: `${user.first_name} ${user.last_name}`,
      transactionNumber: transaction.transaction_number,
      invoiceNumber: invoice.invoice_number,
      amount: transaction.amount,
      date: transaction.processed_at,
      description: invoice.description,
      paymentMethod: 'Credit Card',
    });

    logger.info(`✅ Payment processed and receipt sent for transaction: ${transaction.transaction_number}`);
  } catch (error) {
    logger.error('Error handling payment success:', error.message);
    throw error;
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const invoiceId = paymentIntent.metadata.invoice_id;
    const parentId = paymentIntent.metadata.parent_id;

    if (!invoiceId || !parentId) {
      logger.warn('Failed payment intent missing metadata:', paymentIntent.id);
      return;
    }

    // Get user details
    const userResult = await db.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [parentId]
    );

    if (userResult.rows.length === 0) {
      logger.warn(`User not found for failed payment: ${parentId}`);
      return;
    }

    const user = userResult.rows[0];
    const invoice = await billingService.getInvoiceById(invoiceId);

    // Send payment failed notification email
    await emailService.sendEmail(
      user.email,
      'Payment Failed - Vanguard Sports Academy',
      `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 40px 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Payment Failed</h1>
          </div>

          <div style="padding: 40px 30px; background: #f9fafb;">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
              Hi <strong>${user.first_name}</strong>,
            </p>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
              We were unable to process your payment for invoice <strong>${invoice.invoice_number}</strong>.
            </p>

            <div style="background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 8px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Invoice Number:</strong></p>
              <p style="color: #1f2937; font-size: 16px; font-weight: 600; margin: 0 0 16px 0;">${invoice.invoice_number}</p>

              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;"><strong>Amount:</strong></p>
              <p style="color: #1f2937; font-size: 20px; font-weight: 700; margin: 0;">
                ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.total_amount)}
              </p>
            </div>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
              <strong>Reason:</strong> ${paymentIntent.last_payment_error?.message || 'Payment could not be completed'}
            </p>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
              Please update your payment method and try again. If you continue to experience issues, contact your bank or our support team.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${getFrontendUrl()}/billing"
                 style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
                Try Again
              </a>
            </div>
          </div>

          <div style="background: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 13px; margin: 0 0 10px 0;">
              Need help? Contact us at <a href="mailto:${process.env.EMAIL_ADMIN}" style="color: #ef4444; text-decoration: none;">${process.env.EMAIL_ADMIN}</a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Vanguard Sports Academy - Building Champions
            </p>
          </div>
        </div>
      `
    );

    logger.info(`Payment failed notification sent for invoice: ${invoice.invoice_number}`);
  } catch (error) {
    logger.error('Error handling payment failure:', error.message);
    throw error;
  }
};

/**
 * Handle refund
 */
const handleRefund = async (charge) => {
  try {
    const paymentIntentId = charge.payment_intent;

    // Find transaction by payment intent ID
    const txnResult = await db.query(
      'SELECT * FROM transactions WHERE stripe_payment_intent_id = $1',
      [paymentIntentId]
    );

    if (txnResult.rows.length === 0) {
      logger.warn(`Transaction not found for refunded charge: ${charge.id}`);
      return;
    }

    const transaction = txnResult.rows[0];

    // Update transaction status to refunded
    await db.query(
      'UPDATE transactions SET status = $1 WHERE id = $2',
      ['refunded', transaction.id]
    );

    // Update invoice status to refunded
    await db.query(
      'UPDATE invoices SET status = $1 WHERE id = $2',
      ['refunded', transaction.invoice_id]
    );

    // Get user and invoice details
    const userResult = await db.query(
      'SELECT email, first_name, last_name FROM users WHERE id = $1',
      [transaction.parent_id]
    );

    if (userResult.rows.length === 0) {
      logger.warn(`User not found for refund: ${transaction.parent_id}`);
      return;
    }

    const user = userResult.rows[0];
    const invoice = await billingService.getInvoiceById(transaction.invoice_id);

    // Send refund confirmation email
    await emailService.sendRefundEmail({
      email: user.email,
      parentName: `${user.first_name} ${user.last_name}`,
      transactionNumber: transaction.transaction_number,
      refundAmount: charge.amount_refunded / 100,
      originalAmount: transaction.amount,
      reason: 'Your refund request has been processed',
    });

    logger.info(`✅ Refund processed for transaction: ${transaction.transaction_number}`);
  } catch (error) {
    logger.error('Error handling refund:', error.message);
    throw error;
  }
};

module.exports = {
  handleStripeWebhook,
};
