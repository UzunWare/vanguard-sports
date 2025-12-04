import apiClient from './api';

/**
 * Billing Service
 * Handles all billing-related API calls
 */

export const billingService = {
  /**
   * Get current user's invoices
   */
  async getMyInvoices() {
    const response = await apiClient.get('/billing/invoices');

    // Transform backend data to frontend format
    if (response.invoices) {
      response.invoices = response.invoices.map(invoice => ({
        id: invoice.transaction_number || invoice.id,
        date: invoice.created_at,
        description: invoice.description || `${invoice.session_name} - Monthly`,
        amount: invoice.amount,
        status: invoice.status === 'succeeded' ? 'Paid' :
                invoice.status === 'failed' ? 'Failed' :
                invoice.status === 'refunded' ? 'Refunded' : 'Pending',
        downloadUrl: invoice.receipt_url || '#'
      }));
    }

    return response.invoices || [];
  },

  /**
   * Get current user's transactions
   */
  async getMyTransactions() {
    const response = await apiClient.get('/billing/transactions');

    // Transform backend data to frontend format
    if (response.transactions) {
      response.transactions = response.transactions.map(txn => ({
        id: txn.transaction_number,
        date: txn.processed_at || txn.created_at,
        userName: txn.parent_name,
        description: txn.description,
        amount: txn.amount,
        status: txn.status === 'succeeded' ? 'Paid' :
                txn.status === 'failed' ? 'Failed' :
                txn.status === 'refunded' ? 'Refunded' : 'Pending',
        paymentMethod: txn.payment_method || 'Credit Card'
      }));
    }

    return response.transactions || [];
  },

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id) {
    return apiClient.get(`/billing/invoices/${id}`);
  },

  /**
   * Create payment intent for enrollment
   */
  async createPaymentIntent(enrollmentId) {
    return apiClient.post('/billing/create-payment-intent', {
      enrollmentId
    });
  },

  /**
   * Confirm payment after Stripe processes it
   */
  async confirmPayment(paymentIntentId) {
    return apiClient.post('/billing/confirm-payment', {
      paymentIntentId
    });
  }
};

export default billingService;
