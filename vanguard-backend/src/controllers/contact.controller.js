/**
 * Contact Controller
 * Handles contact form and newsletter submissions
 */

const emailService = require('../services/email.service');
const logger = require('../utils/logger');

/**
 * Submit contact form
 * POST /api/contact
 */
const submitContactForm = async (req, res, next) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required',
        },
      });
    }

    // Send email
    await emailService.sendContactFormEmail({
      firstName,
      lastName,
      email,
      message,
    });

    res.status(200).json({
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    logger.error('Error submitting contact form:', error);
    next(error);
  }
};

/**
 * Subscribe to newsletter
 * POST /api/contact/newsletter
 */
const subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    // Send confirmation email
    await emailService.sendNewsletterConfirmation({ email });

    // TODO: Add email to newsletter database/mailing list

    res.status(200).json({
      message: 'Successfully subscribed to newsletter!',
    });
  } catch (error) {
    logger.error('Error subscribing to newsletter:', error);
    next(error);
  }
};

module.exports = {
  submitContactForm,
  subscribeNewsletter,
};
