/**
 * Admin Service
 * Handles admin-specific operations for dashboard analytics and reporting
 */

const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get financial overview statistics
 */
const getFinancialOverview = async () => {
  try {
    // Total revenue from all successful transactions
    const revenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_revenue
      FROM transactions
      WHERE status = 'succeeded'
    `;
    const revenueResult = await db.query(revenueQuery);

    // Monthly revenue
    const monthlyRevenueQuery = `
      SELECT COALESCE(SUM(amount), 0) as monthly_revenue
      FROM transactions
      WHERE status = 'succeeded'
        AND DATE_TRUNC('month', processed_at) = DATE_TRUNC('month', CURRENT_DATE)
    `;
    const monthlyResult = await db.query(monthlyRevenueQuery);

    // Pending invoices
    const pendingInvoicesQuery = `
      SELECT COUNT(*) as pending_count, COALESCE(SUM(total_amount), 0) as pending_amount
      FROM invoices
      WHERE status = 'pending'
    `;
    const pendingResult = await db.query(pendingInvoicesQuery);

    // Total transactions
    const transactionsCountQuery = `
      SELECT COUNT(*) as total_transactions
      FROM transactions
      WHERE status = 'succeeded'
    `;
    const transactionsResult = await db.query(transactionsCountQuery);

    return {
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      monthlyRevenue: parseFloat(monthlyResult.rows[0].monthly_revenue),
      pendingInvoices: parseInt(pendingResult.rows[0].pending_count),
      pendingAmount: parseFloat(pendingResult.rows[0].pending_amount),
      totalTransactions: parseInt(transactionsResult.rows[0].total_transactions),
    };
  } catch (error) {
    logger.error('Get financial overview error:', error.message);
    throw error;
  }
};

/**
 * Get revenue by sport breakdown
 */
const getRevenueBreakdownBySport = async () => {
  try {
    const query = `
      SELECT
        s.sport,
        COUNT(DISTINCT t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_revenue
      FROM transactions t
      INNER JOIN invoices i ON t.invoice_id = i.id
      INNER JOIN enrollments e ON i.enrollment_id = e.id
      INNER JOIN sessions s ON e.session_id = s.id
      WHERE t.status = 'succeeded'
      GROUP BY s.sport
      ORDER BY total_revenue DESC
    `;

    const result = await db.query(query);

    return result.rows.map(row => ({
      sport: row.sport,
      transactionCount: parseInt(row.transaction_count),
      revenue: parseFloat(row.total_revenue),
    }));
  } catch (error) {
    logger.error('Get revenue breakdown by sport error:', error.message);
    throw error;
  }
};

/**
 * Get monthly revenue trend (last 12 months)
 */
const getMonthlyRevenueTrend = async () => {
  try {
    const query = `
      SELECT
        TO_CHAR(DATE_TRUNC('month', processed_at), 'Mon YYYY') as month,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE status = 'succeeded'
        AND processed_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', processed_at)
      ORDER BY DATE_TRUNC('month', processed_at) ASC
    `;

    const result = await db.query(query);

    return result.rows.map(row => ({
      month: row.month,
      revenue: parseFloat(row.revenue),
      transactionCount: parseInt(row.transaction_count),
    }));
  } catch (error) {
    logger.error('Get monthly revenue trend error:', error.message);
    throw error;
  }
};

/**
 * Get recent transactions with details
 */
const getRecentTransactions = async (limit = 50) => {
  try {
    const query = `
      SELECT
        t.id,
        t.transaction_number,
        t.amount,
        t.status,
        t.processed_at,
        t.created_at,
        i.invoice_number,
        i.description,
        u.first_name || ' ' || u.last_name as parent_name,
        u.email as parent_email,
        a.first_name || ' ' || a.last_name as athlete_name,
        s.sport,
        s.level,
        pm.card_brand,
        pm.card_last4
      FROM transactions t
      INNER JOIN invoices i ON t.invoice_id = i.id
      INNER JOIN users u ON t.parent_id = u.id
      LEFT JOIN enrollments e ON i.enrollment_id = e.id
      LEFT JOIN athletes a ON e.athlete_id = a.id
      LEFT JOIN sessions s ON e.session_id = s.id
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      ORDER BY t.created_at DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);

    return result.rows.map(row => ({
      id: row.id,
      transactionNumber: row.transaction_number,
      amount: parseFloat(row.amount),
      status: row.status,
      processedAt: row.processed_at,
      createdAt: row.created_at,
      invoiceNumber: row.invoice_number,
      description: row.description,
      parentName: row.parent_name,
      parentEmail: row.parent_email,
      athleteName: row.athlete_name,
      sport: row.sport,
      level: row.level,
      paymentMethod: row.card_brand && row.card_last4
        ? `${row.card_brand} ****${row.card_last4}`
        : 'N/A',
    }));
  } catch (error) {
    logger.error('Get recent transactions error:', error.message);
    throw error;
  }
};

/**
 * Get active subscriptions statistics
 */
const getSubscriptionStats = async () => {
  try {
    // Count active enrollments (these are subscription-like)
    const activeQuery = `
      SELECT COUNT(*) as active_count
      FROM enrollments
      WHERE status = 'confirmed'
    `;
    const activeResult = await db.query(activeQuery);

    // Count pending enrollments
    const pendingQuery = `
      SELECT COUNT(*) as pending_count
      FROM enrollments
      WHERE status = 'pending'
    `;
    const pendingResult = await db.query(pendingQuery);

    // Count completed enrollments
    const completedQuery = `
      SELECT COUNT(*) as completed_count
      FROM enrollments
      WHERE status = 'completed'
    `;
    const completedResult = await db.query(completedQuery);

    return {
      active: parseInt(activeResult.rows[0].active_count),
      pending: parseInt(pendingResult.rows[0].pending_count),
      completed: parseInt(completedResult.rows[0].completed_count),
    };
  } catch (error) {
    logger.error('Get subscription stats error:', error.message);
    throw error;
  }
};

/**
 * Get top paying parents
 */
const getTopPayingParents = async (limit = 10) => {
  try {
    const query = `
      SELECT
        u.id,
        u.first_name || ' ' || u.last_name as name,
        u.email,
        COUNT(DISTINCT t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_spent
      FROM users u
      INNER JOIN transactions t ON u.id = t.parent_id
      WHERE t.status = 'succeeded'
        AND u.role = 'parent'
      GROUP BY u.id, u.first_name, u.last_name, u.email
      ORDER BY total_spent DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      transactionCount: parseInt(row.transaction_count),
      totalSpent: parseFloat(row.total_spent),
    }));
  } catch (error) {
    logger.error('Get top paying parents error:', error.message);
    throw error;
  }
};

/**
 * Get payment method statistics
 */
const getPaymentMethodStats = async () => {
  try {
    const query = `
      SELECT
        pm.card_brand as method,
        COUNT(DISTINCT t.id) as transaction_count,
        COALESCE(SUM(t.amount), 0) as total_amount
      FROM transactions t
      LEFT JOIN payment_methods pm ON t.payment_method_id = pm.id
      WHERE t.status = 'succeeded'
      GROUP BY pm.card_brand
      ORDER BY total_amount DESC
    `;

    const result = await db.query(query);

    return result.rows.map(row => ({
      method: row.method || 'Credit Card',
      transactionCount: parseInt(row.transaction_count),
      totalAmount: parseFloat(row.total_amount),
    }));
  } catch (error) {
    logger.error('Get payment method stats error:', error.message);
    throw error;
  }
};

/**
 * Search transactions with advanced filters
 */
const searchTransactions = async (filters = {}) => {
  try {
    let query = `
      SELECT
        t.id,
        t.transaction_number,
        t.amount,
        t.status,
        t.processed_at,
        t.created_at,
        i.invoice_number,
        i.description,
        u.first_name || ' ' || u.last_name as parent_name,
        u.email as parent_email,
        a.first_name || ' ' || a.last_name as athlete_name,
        s.sport,
        s.level
      FROM transactions t
      INNER JOIN invoices i ON t.invoice_id = i.id
      INNER JOIN users u ON t.parent_id = u.id
      LEFT JOIN enrollments e ON i.enrollment_id = e.id
      LEFT JOIN athletes a ON e.athlete_id = a.id
      LEFT JOIN sessions s ON e.session_id = s.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.sport) {
      query += ` AND s.sport = $${paramCount}`;
      params.push(filters.sport);
      paramCount++;
    }

    if (filters.startDate) {
      query += ` AND t.processed_at >= $${paramCount}`;
      params.push(filters.startDate);
      paramCount++;
    }

    if (filters.endDate) {
      query += ` AND t.processed_at <= $${paramCount}`;
      params.push(filters.endDate);
      paramCount++;
    }

    if (filters.minAmount) {
      query += ` AND t.amount >= $${paramCount}`;
      params.push(filters.minAmount);
      paramCount++;
    }

    if (filters.maxAmount) {
      query += ` AND t.amount <= $${paramCount}`;
      params.push(filters.maxAmount);
      paramCount++;
    }

    if (filters.searchQuery) {
      query += ` AND (
        t.transaction_number ILIKE $${paramCount} OR
        i.invoice_number ILIKE $${paramCount} OR
        u.first_name ILIKE $${paramCount} OR
        u.last_name ILIKE $${paramCount} OR
        u.email ILIKE $${paramCount}
      )`;
      params.push(`%${filters.searchQuery}%`);
      paramCount++;
    }

    query += ` ORDER BY t.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      transactionNumber: row.transaction_number,
      amount: parseFloat(row.amount),
      status: row.status,
      processedAt: row.processed_at,
      createdAt: row.created_at,
      invoiceNumber: row.invoice_number,
      description: row.description,
      parentName: row.parent_name,
      parentEmail: row.parent_email,
      athleteName: row.athlete_name,
      sport: row.sport,
      level: row.level,
    }));
  } catch (error) {
    logger.error('Search transactions error:', error.message);
    throw error;
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
};
