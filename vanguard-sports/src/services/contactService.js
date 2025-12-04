import apiClient from './api';

/**
 * Contact Service
 * Handles contact form and newsletter API calls
 */

const contactService = {
  /**
   * Submit contact form
   * @param {Object} contactData - { firstName, lastName, email, message }
   */
  async submitContactForm(contactData) {
    return apiClient.post('/contact', contactData, { skipAuth: true });
  },

  /**
   * Subscribe to newsletter
   * @param {string} email - Email address to subscribe
   */
  async subscribeNewsletter(email) {
    return apiClient.post('/contact/newsletter', { email }, { skipAuth: true });
  },
};

export default contactService;
