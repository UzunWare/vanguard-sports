/**
 * Email Configuration
 * Nodemailer setup for sending emails
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Create email transporter
 * Uses Gmail by default, but can be configured for other providers
 */
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    logger.warn('Email credentials not configured. Emails will not be sent.');
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Verify connection configuration
  transporter.verify((error) => {
    if (error) {
      logger.error('Email transporter verification failed:', error);
    } else {
      logger.info('Email transporter is ready to send emails');
    }
  });

  return transporter;
};

const transporter = createTransporter();

/**
 * Email configuration options
 */
const emailConfig = {
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@vanguardsports.com',
  adminEmail: process.env.EMAIL_ADMIN || 'vanguardsportsacademytx@gmail.com',
};

module.exports = {
  transporter,
  emailConfig,
};
