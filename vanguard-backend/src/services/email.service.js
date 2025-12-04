/**
 * Email Service
 * Handles all email sending operations
 */

const { transporter, emailConfig } = require('../config/email');
const logger = require('../utils/logger');

/**
 * Get frontend URL - fail in production if not configured
 */
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL;

  if (!url && process.env.NODE_ENV === 'production') {
    logger.error('❌ FRONTEND_URL environment variable is required in production');
    throw new Error('FRONTEND_URL not configured');
  }

  // Return configured URL or localhost for development
  return url || 'http://localhost:5173';
};

/**
 * Mask email address for privacy in logs
 * Example: john.doe@example.com → j***@example.com
 */
const maskEmail = (email) => {
  if (!email || typeof email !== 'string') return '[invalid-email]';

  const [local, domain] = email.split('@');
  if (!local || !domain) return '[invalid-email]';

  return `${local.charAt(0)}***@${domain}`;
};

/**
 * Send email helper function
 */
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    logger.warn(`Email not sent (transporter not configured): ${subject} to ${maskEmail(to)}`);
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${subject} to ${maskEmail(to)}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Failed to send email: ${subject} to ${maskEmail(to)}`, error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send contact form email to admin
 */
const sendContactFormEmail = async ({ firstName, lastName, email, message }) => {
  const subject = `New Contact Form Submission from ${firstName} ${lastName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ea580c; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f8f9fa; padding: 30px; margin-top: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #555; }
        .value { margin-top: 5px; padding: 10px; background-color: white; border-left: 3px solid #ea580c; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${firstName} ${lastName}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="value">${message.replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from the Vanguard Sports Academy contact form.</p>
          <p>Reply directly to <a href="mailto:${email}">${email}</a> to respond.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(emailConfig.adminEmail, subject, html);
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async ({ email, firstName, lastName }) => {
  const subject = 'Welcome to Vanguard Sports Academy!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ea580c; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Vanguard Sports Academy!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Thank you for joining Vanguard Sports Academy! We're excited to have you as part of our community.</p>

          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>Browse and enroll in training sessions</li>
            <li>Manage your athlete profiles</li>
            <li>Track progress and evaluations</li>
            <li>Access your account settings</li>
          </ul>

          <p>If you have any questions or need assistance, don't hesitate to reach out to us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>

          <p>Let's get started on your athletic journey!</p>

          <a href="${getFrontendUrl()}/login" class="button">Login to Your Account</a>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send welcome email with temporary password for auto-created accounts
 */
const sendAccountCreatedEmail = async ({ email, firstName, lastName, temporaryPassword }) => {
  const subject = 'Your Vanguard Sports Academy Account is Ready!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .credentials-box { background-color: white; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .credential-row { padding: 10px 0; }
        .credential-label { font-weight: bold; color: #555; font-size: 14px; }
        .credential-value { font-family: 'Courier New', monospace; background-color: #f1f5f9; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; font-size: 16px; color: #0f172a; }
        .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        .icon { font-size: 48px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">✓</div>
          <h1>Account Created Successfully!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Great news! We've automatically created a parent account for you during your athlete's enrollment. This gives you access to:</p>

          <ul>
            <li><strong>Parent Dashboard</strong> - View all your athlete's sessions and progress</li>
            <li><strong>Schedule Management</strong> - See upcoming classes and events</li>
            <li><strong>Billing Portal</strong> - Manage payments and view invoices</li>
            <li><strong>Communication</strong> - Receive updates from coaches and admin</li>
          </ul>

          <div class="credentials-box">
            <h3 style="margin-top: 0; color: #333;">Your Login Credentials</h3>

            <div class="credential-row">
              <div class="credential-label">Email:</div>
              <div class="credential-value">${email}</div>
            </div>

            <div class="credential-row">
              <div class="credential-label">Temporary Password:</div>
              <div class="credential-value">${temporaryPassword}</div>
            </div>
          </div>

          <div class="alert-box">
            <p style="margin: 0;"><strong>⚠️ Important Security Notice:</strong></p>
            <p style="margin: 10px 0 0 0;">For your security, you'll be required to create a new password when you first log in. Please choose a strong, unique password that you don't use elsewhere.</p>
          </div>

          <p><strong>Get Started Now:</strong></p>
          <ol>
            <li>Click the button below to log in</li>
            <li>Enter your email and temporary password</li>
            <li>You'll be prompted to create a new, secure password</li>
            <li>Start managing your athlete's journey!</li>
          </ol>

          <div style="text-align: center;">
            <a href="${getFrontendUrl()}/login" class="button">Login to Your Dashboard</a>
          </div>

          <p style="margin-top: 30px;">If you have any questions or need assistance, contact us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
          <p style="margin-top: 10px; font-size: 11px; color: #999;">This email contains sensitive information. Please delete it after changing your password.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send password change notification
 */
const sendPasswordChangeEmail = async ({ email, firstName }) => {
  const subject = 'Your Password Has Been Changed';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .alert { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>This email confirms that your password for Vanguard Sports Academy has been successfully changed.</p>

          <div class="alert">
            <strong>⚠️ If you did not make this change:</strong><br>
            Please contact us immediately at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a> or reset your password.
          </div>

          <p>For your security, we recommend:</p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Not sharing your password with anyone</li>
            <li>Changing your password regularly</li>
          </ul>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>This is an automated security notification</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send enrollment confirmation email
 */
const sendEnrollmentConfirmationEmail = async ({
  parentEmail,
  parentName,
  athleteName,
  sessionTitle,
  sessionDate,
  sessionTime,
  sessionLocation
}) => {
  const subject = `Enrollment Confirmed: ${sessionTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .session-details { background-color: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: bold; color: #555; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Enrollment Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hi ${parentName},</h2>
          <p>Great news! <strong>${athleteName}</strong> has been successfully enrolled in the following session:</p>

          <div class="session-details">
            <div class="detail-row">
              <div class="detail-label">Session:</div>
              <div>${sessionTitle}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Date:</div>
              <div>${sessionDate}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Time:</div>
              <div>${sessionTime}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Location:</div>
              <div>${sessionLocation}</div>
            </div>
          </div>

          <p><strong>What to bring:</strong></p>
          <ul>
            <li>Athletic wear and proper footwear</li>
            <li>Water bottle</li>
            <li>Positive attitude and ready to learn!</li>
          </ul>

          <p>You can view all your enrolled sessions and manage your account by logging in to your parent dashboard.</p>

          <p>If you have any questions, please contact us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(parentEmail, subject, html);
};

/**
 * Send newsletter subscription confirmation
 */
const sendNewsletterConfirmation = async ({ email }) => {
  const subject = 'Welcome to Vanguard Sports Newsletter!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ea580c; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Subscribed!</h1>
        </div>
        <div class="content">
          <h2>Thanks for subscribing!</h2>
          <p>You'll now receive updates about:</p>
          <ul>
            <li>New training sessions and programs</li>
            <li>Special events and tournaments</li>
            <li>Athletic tips and resources</li>
            <li>Exclusive offers for members</li>
          </ul>
          <p>Stay tuned for our next newsletter!</p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>You can unsubscribe at any time by clicking the link in our emails.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send payment receipt email
 */
const sendPaymentReceiptEmail = async ({
  email,
  parentName,
  transactionNumber,
  invoiceNumber,
  amount,
  date,
  description,
  paymentMethod
}) => {
  const subject = 'Payment Receipt - Vanguard Sports Academy';
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .receipt-box { background-color: white; padding: 20px; border-left: 4px solid #16a34a; margin: 20px 0; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .total-row { padding: 15px 0; font-size: 18px; font-weight: bold; color: #16a34a; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Payment Received</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Thank you for your payment</p>
        </div>
        <div class="content">
          <h2>Hi ${parentName},</h2>
          <p>Your payment has been successfully processed. Below is your receipt for this transaction.</p>

          <div class="receipt-box">
            <h3 style="margin-top: 0; color: #333;">Payment Details</h3>

            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${transactionNumber}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${invoiceNumber}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${formattedDate}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${description}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">${paymentMethod}</span>
            </div>

            <div class="detail-row total-row">
              <span>Total Amount Paid:</span>
              <span>${formattedAmount}</span>
            </div>
          </div>

          <p><strong>Keep this receipt for your records.</strong> You can access all your transaction history in your parent dashboard.</p>

          <p>If you have any questions about this payment, please contact us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send invoice email
 */
const sendInvoiceEmail = async ({
  email,
  parentName,
  invoiceNumber,
  amount,
  dueDate,
  description
}) => {
  const subject = `Invoice ${invoiceNumber} - Vanguard Sports Academy`;
  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ea580c; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .invoice-box { background-color: white; padding: 20px; border-left: 4px solid #ea580c; margin: 20px 0; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .total-row { padding: 15px 0; font-size: 18px; font-weight: bold; color: #ea580c; }
        .button { display: inline-block; padding: 12px 30px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice Due</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Payment is required</p>
        </div>
        <div class="content">
          <h2>Hi ${parentName},</h2>
          <p>You have a new invoice for your athlete's enrollment at Vanguard Sports Academy.</p>

          <div class="invoice-box">
            <h3 style="margin-top: 0; color: #333;">Invoice Details</h3>

            <div class="detail-row">
              <span class="detail-label">Invoice Number:</span>
              <span class="detail-value">${invoiceNumber}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${formattedDueDate}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${description}</span>
            </div>

            <div class="detail-row total-row">
              <span>Amount Due:</span>
              <span>${formattedAmount}</span>
            </div>
          </div>

          <p><strong>Payment is due by ${formattedDueDate}.</strong> Please log in to your parent dashboard to complete the payment.</p>

          <a href="${getFrontendUrl()}/login" class="button">Pay Invoice</a>

          <p style="margin-top: 20px;">If you have any questions about this invoice, please contact us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send recurring payment confirmation
 */
const sendRecurringPaymentEmail = async ({
  email,
  parentName,
  amount,
  nextBillingDate,
  description
}) => {
  const subject = 'Monthly Payment Processed - Vanguard Sports Academy';
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
  const formattedNextDate = new Date(nextBillingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .payment-box { background-color: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .highlight { font-size: 24px; font-weight: bold; color: #3b82f6; margin: 15px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Monthly Payment Processed</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your subscription is active</p>
        </div>
        <div class="content">
          <h2>Hi ${parentName},</h2>
          <p>Your monthly payment for ${description} has been successfully processed.</p>

          <div class="payment-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Payment Amount</p>
            <div class="highlight">${formattedAmount}</div>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Next billing date: <strong>${formattedNextDate}</strong></p>
          </div>

          <p>Your athlete's enrollment continues without interruption. You can view your payment history and manage your subscription in your parent dashboard.</p>

          <p>If you need to update your payment method or have any questions, please contact us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send refund confirmation email
 */
const sendRefundEmail = async ({
  email,
  parentName,
  transactionNumber,
  refundAmount,
  originalAmount,
  reason
}) => {
  const subject = 'Refund Processed - Vanguard Sports Academy';
  const formattedRefund = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(refundAmount);
  const formattedOriginal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(originalAmount);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8b5cf6; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background-color: #f8f9fa; margin-top: 20px; }
        .refund-box { background-color: white; padding: 20px; border-left: 4px solid #8b5cf6; margin: 20px 0; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .highlight { font-size: 24px; font-weight: bold; color: #8b5cf6; margin: 15px 0; }
        .info-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Refund Processed</h1>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">Your refund has been issued</p>
        </div>
        <div class="content">
          <h2>Hi ${parentName},</h2>
          <p>${reason}</p>

          <div class="refund-box">
            <h3 style="margin-top: 0; color: #333;">Refund Details</h3>

            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${transactionNumber}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Original Payment:</span>
              <span class="detail-value">${formattedOriginal}</span>
            </div>

            <div class="detail-row" style="border: none;">
              <span class="detail-label">Refund Amount:</span>
              <span class="detail-value highlight">${formattedRefund}</span>
            </div>
          </div>

          <div class="info-box">
            <p style="margin: 0;"><strong>⏱ Processing Time:</strong> Refunds typically appear in your account within 5-10 business days, depending on your financial institution.</p>
          </div>

          <p>The refund will be credited to the original payment method used for this transaction. You'll receive the funds from your bank or card issuer.</p>

          <p>If you have any questions about this refund or don't receive it within the expected timeframe, please contact us at <a href="mailto:vanguardsportsacademytx@gmail.com">vanguardsportsacademytx@gmail.com</a></p>
        </div>
        <div class="footer">
          <p><strong>Vanguard Sports Academy</strong></p>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

/**
 * Send announcement email to parents
 */
const sendAnnouncementEmail = async ({
  email,
  parentName,
  senderName,
  senderRole,
  title,
  message,
  sessionInfo,
}) => {
  const subject = `Announcement: ${title} - Vanguard Sports Academy`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1e293b; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 { font-size: 28px; font-weight: 700; margin: 0; }
        .content { padding: 40px 30px; }
        .badge {
          display: inline-block;
          background: #e0f2fe;
          color: #0369a1;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
        .greeting { color: #1e293b; font-size: 16px; margin-bottom: 20px; }
        .announcement-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin: 20px 0;
          padding-bottom: 15px;
          border-bottom: 3px solid #0ea5e9;
        }
        .announcement-message {
          background: #f1f5f9;
          border-left: 4px solid #0ea5e9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          color: #334155;
          font-size: 15px;
          line-height: 1.8;
          white-space: pre-wrap;
        }
        .session-info {
          background: #dbeafe;
          border: 1px solid #0ea5e9;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .session-info strong {
          color: #0369a1;
          font-size: 14px;
        }
        .sender-info {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 14px;
        }
        .sender-info strong { color: #475569; }
        .footer {
          background: #f1f5f9;
          padding: 30px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
          border-top: 1px solid #e2e8f0;
        }
        .footer strong { color: #475569; display: block; margin-bottom: 5px; }
        a { color: #0ea5e9; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📢 New Announcement</h1>
        </div>

        <div class="content">
          <div class="badge">${senderRole}</div>

          <p class="greeting">
            Hi <strong>${parentName}</strong>,
          </p>

          <p style="color: #475569; margin-bottom: 20px;">
            ${senderName} has shared an important announcement with you:
          </p>

          <div class="announcement-title">
            ${title}
          </div>

          <div class="announcement-message">
            ${message}
          </div>

          ${sessionInfo ? `
            <div class="session-info">
              <strong>📅 Related to:</strong> ${sessionInfo}
            </div>
          ` : ''}

          <div class="sender-info">
            <strong>From:</strong> ${senderName} (${senderRole})<br>
            <strong>Sent:</strong> ${new Date().toLocaleString('en-US', {
              dateStyle: 'full',
              timeStyle: 'short',
            })}
          </div>

          <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
            If you have any questions or concerns about this announcement, please don't hesitate to reach out to us at
            <a href="mailto:${process.env.EMAIL_ADMIN || 'vanguardsportsacademytx@gmail.com'}">
              ${process.env.EMAIL_ADMIN || 'vanguardsportsacademytx@gmail.com'}
            </a>
          </p>
        </div>

        <div class="footer">
          <strong>Vanguard Sports Academy</strong>
          <p>Building Champions, One Athlete at a Time</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(email, subject, html);
};

module.exports = {
  sendContactFormEmail,
  sendWelcomeEmail,
  sendAccountCreatedEmail,
  sendPasswordChangeEmail,
  sendEnrollmentConfirmationEmail,
  sendNewsletterConfirmation,
  sendPaymentReceiptEmail,
  sendInvoiceEmail,
  sendRecurringPaymentEmail,
  sendRefundEmail,
  sendAnnouncementEmail,
  sendEmail, // Export the base sendEmail function for direct use
};
