/**
 * Admin Routes
 * Routes for admin dashboard, analytics, and management
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

/**
 * Financial Dashboard Routes
 */

// Get complete financial dashboard data (all endpoints in one)
router.get('/dashboard/financial', adminController.getFinancialDashboard);

// Get financial overview (total revenue, monthly revenue, pending invoices)
router.get('/financial/overview', adminController.getFinancialOverview);

// Get revenue breakdown by sport
router.get('/financial/revenue-by-sport', adminController.getRevenueBreakdownBySport);

// Get monthly revenue trend (last 12 months)
router.get('/financial/revenue-trend', adminController.getMonthlyRevenueTrend);

/**
 * Transaction Routes
 */

// Get recent transactions
router.get('/transactions/recent', adminController.getRecentTransactions);

// Search transactions with advanced filters
router.get('/transactions/search', adminController.searchTransactions);

/**
 * Analytics Routes
 */

// Get subscription statistics
router.get('/subscriptions/stats', adminController.getSubscriptionStats);

// Get top paying parents
router.get('/analytics/top-parents', adminController.getTopPayingParents);

// Get payment method statistics
router.get('/analytics/payment-methods', adminController.getPaymentMethodStats);

module.exports = router;
