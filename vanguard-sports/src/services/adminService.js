import apiClient from './api';

/**
 * Admin Service
 * Handles all admin-related API calls for dashboard analytics and reporting
 */

export const adminService = {
  /**
   * Get complete financial dashboard data (all endpoints in one)
   */
  async getFinancialDashboard() {
    const response = await apiClient.get('/admin/dashboard/financial');
    return response;
  },

  /**
   * Get financial overview
   */
  async getFinancialOverview() {
    const response = await apiClient.get('/admin/financial/overview');
    return response.overview;
  },

  /**
   * Get revenue breakdown by sport
   */
  async getRevenueBreakdownBySport() {
    const response = await apiClient.get('/admin/financial/revenue-by-sport');
    return response.breakdown;
  },

  /**
   * Get monthly revenue trend (last 12 months)
   */
  async getMonthlyRevenueTrend() {
    const response = await apiClient.get('/admin/financial/revenue-trend');
    return response.trend;
  },

  /**
   * Get recent transactions
   */
  async getRecentTransactions(limit = 50) {
    const response = await apiClient.get(`/admin/transactions/recent?limit=${limit}`);
    return response.transactions;
  },

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    const response = await apiClient.get('/admin/subscriptions/stats');
    return response.stats;
  },

  /**
   * Get top paying parents
   */
  async getTopPayingParents(limit = 10) {
    const response = await apiClient.get(`/admin/analytics/top-parents?limit=${limit}`);
    return response.parents;
  },

  /**
   * Get payment method statistics
   */
  async getPaymentMethodStats() {
    const response = await apiClient.get('/admin/analytics/payment-methods');
    return response.stats;
  },

  /**
   * Search transactions with filters
   */
  async searchTransactions(filters = {}) {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.minAmount) params.append('minAmount', filters.minAmount);
    if (filters.maxAmount) params.append('maxAmount', filters.maxAmount);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = `/admin/transactions/search${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url);
    return response.transactions;
  },
};

export default adminService;
