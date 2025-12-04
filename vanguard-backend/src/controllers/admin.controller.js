/**
 * Admin Controller
 * Handles HTTP requests for admin dashboard and analytics
 */

const adminService = require('../services/admin.service');
const logger = require('../utils/logger');

/**
 * Get financial overview
 * GET /api/admin/financial/overview
 */
const getFinancialOverview = async (req, res, next) => {
  try {
    const overview = await adminService.getFinancialOverview();

    res.status(200).json({
      overview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue breakdown by sport
 * GET /api/admin/financial/revenue-by-sport
 */
const getRevenueBreakdownBySport = async (req, res, next) => {
  try {
    const breakdown = await adminService.getRevenueBreakdownBySport();

    res.status(200).json({
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly revenue trend
 * GET /api/admin/financial/revenue-trend
 */
const getMonthlyRevenueTrend = async (req, res, next) => {
  try {
    const trend = await adminService.getMonthlyRevenueTrend();

    res.status(200).json({
      trend,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent transactions
 * GET /api/admin/transactions/recent
 */
const getRecentTransactions = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const transactions = await adminService.getRecentTransactions(limit);

    res.status(200).json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get subscription statistics
 * GET /api/admin/subscriptions/stats
 */
const getSubscriptionStats = async (req, res, next) => {
  try {
    const stats = await adminService.getSubscriptionStats();

    res.status(200).json({
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top paying parents
 * GET /api/admin/analytics/top-parents
 */
const getTopPayingParents = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const parents = await adminService.getTopPayingParents(limit);

    res.status(200).json({
      parents,
      total: parents.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment method statistics
 * GET /api/admin/analytics/payment-methods
 */
const getPaymentMethodStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPaymentMethodStats();

    res.status(200).json({
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search transactions with filters
 * GET /api/admin/transactions/search
 */
const searchTransactions = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      sport: req.query.sport,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      minAmount: req.query.minAmount ? parseFloat(req.query.minAmount) : null,
      maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount) : null,
      searchQuery: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
    };

    const transactions = await adminService.searchTransactions(filters);

    res.status(200).json({
      transactions,
      total: transactions.length,
      filters: filters,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get complete financial dashboard data
 * GET /api/admin/dashboard/financial
 */
const getFinancialDashboard = async (req, res, next) => {
  try {
    // Fetch all data in parallel for better performance
    const [
      overview,
      revenueBySport,
      revenueTrend,
      recentTransactions,
      subscriptionStats,
      topParents,
      paymentMethodStats,
    ] = await Promise.all([
      adminService.getFinancialOverview(),
      adminService.getRevenueBreakdownBySport(),
      adminService.getMonthlyRevenueTrend(),
      adminService.getRecentTransactions(10),
      adminService.getSubscriptionStats(),
      adminService.getTopPayingParents(5),
      adminService.getPaymentMethodStats(),
    ]);

    res.status(200).json({
      overview,
      revenueBySport,
      revenueTrend,
      recentTransactions,
      subscriptionStats,
      topParents,
      paymentMethodStats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFinancialOverview,
  getRevenueBreakdownBySport,
  getMonthlyRevenueTrend,
  getRecentTransactions,
  getSubscriptionStats,
  getTopPayingParents,
  getPaymentMethodStats,
  searchTransactions,
  getFinancialDashboard,
};
