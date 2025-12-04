import React, { useState, useMemo, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Download,
  Search,
  Filter,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Loader
} from 'lucide-react';
import { Card, Badge, Button, Input, Select } from '../../../components/ui';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { adminService } from '../../../services/adminService';

/**
 * FinancialTab
 * Comprehensive financial overview and reporting for admins
 * - Revenue summary with KPIs
 * - Revenue breakdown by sport (pie chart)
 * - Subscription metrics and trends
 * - Transaction history with search and filters
 * - Export functionality (CSV)
 */
const FinancialTab = ({ onNavigateToTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Data State
  const [financialData, setFinancialData] = useState({
    overview: null,
    revenueBySport: [],
    subscriptionStats: null,
    transactions: [],
  });

  // Fetch financial data from API
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data from admin endpoint
        const [overview, revenueBySport, subscriptionStats, transactions] = await Promise.all([
          adminService.getFinancialOverview(),
          adminService.getRevenueBreakdownBySport(),
          adminService.getSubscriptionStats(),
          adminService.getRecentTransactions(200), // Fetch more for filtering
        ]);

        setFinancialData({
          overview,
          revenueBySport,
          subscriptionStats,
          transactions,
        });
      } catch (err) {
        setError(err.message || 'Failed to load financial data');
      } finally{
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  // Map API transactions to UI format
  const mappedTransactions = useMemo(() => {
    return financialData.transactions.map(txn => ({
      id: txn.transactionNumber,
      date: txn.processedAt || txn.createdAt,
      userName: txn.parentName,
      description: txn.description,
      amount: txn.amount,
      status: txn.status === 'succeeded' ? 'Paid' :
              txn.status === 'failed' ? 'Failed' :
              txn.status === 'refunded' ? 'Refunded' : 'Paid',
      paymentMethod: txn.paymentMethod || 'Credit Card',
    }));
  }, [financialData.transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return mappedTransactions.filter(txn => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        txn.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || txn.status === statusFilter;

      // Date range filter
      let matchesDate = true;
      if (dateRange !== 'all') {
        const now = new Date();
        const txnDate = new Date(txn.date);
        const daysDiff = Math.floor((now - txnDate) / (1000 * 60 * 60 * 24));

        if (dateRange === 'week' && daysDiff > 7) matchesDate = false;
        if (dateRange === 'month' && daysDiff > 30) matchesDate = false;
        if (dateRange === 'quarter' && daysDiff > 90) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [mappedTransactions, searchQuery, statusFilter, dateRange]);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    if (!financialData.overview) {
      return {
        totalRevenue: 0,
        revenueGrowth: 0,
        mrr: 0,
        activeSubscriptions: 0,
        arpu: 0,
        ltv: 0,
        paidCount: 0,
        failedCount: 0,
        refundedCount: 0,
      };
    }

    const totalRevenue = financialData.overview.totalRevenue || 0;
    const monthlyRevenue = financialData.overview.monthlyRevenue || 0;
    const previousMonthlyRevenue = totalRevenue > monthlyRevenue ?
      (totalRevenue - monthlyRevenue) / Math.max(1, Math.ceil(totalRevenue / monthlyRevenue - 1)) :
      monthlyRevenue * 0.9; // Estimate if no history

    const revenueGrowth = previousMonthlyRevenue > 0 ?
      ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue * 100).toFixed(1) :
      '0.0';

    const activeSubscriptions = financialData.subscriptionStats?.active || 0;
    const mrr = monthlyRevenue;
    const arpu = activeSubscriptions > 0 ? (mrr / activeSubscriptions) : 0;
    const ltv = arpu * 12; // Approximate LTV (12 months)

    const paidCount = filteredTransactions.filter(t => t.status === 'Paid').length;
    const failedCount = filteredTransactions.filter(t => t.status === 'Failed').length;
    const refundedCount = filteredTransactions.filter(t => t.status === 'Refunded').length;

    return {
      totalRevenue,
      revenueGrowth: parseFloat(revenueGrowth),
      mrr,
      activeSubscriptions,
      arpu,
      ltv,
      paidCount,
      failedCount,
      refundedCount
    };
  }, [financialData, filteredTransactions]);

  // Calculate revenue by sport
  const revenueBySport = useMemo(() => {
    if (!financialData.revenueBySport || financialData.revenueBySport.length === 0) {
      return {
        basketball: 0,
        volleyball: 0,
        basketballPercent: 50,
        volleyballPercent: 50,
      };
    }

    const basketball = financialData.revenueBySport.find(s =>
      s.sport?.toLowerCase() === 'basketball'
    )?.revenue || 0;

    const volleyball = financialData.revenueBySport.find(s =>
      s.sport?.toLowerCase() === 'volleyball'
    )?.revenue || 0;

    const total = basketball + volleyball;
    const basketballPercent = total > 0 ? (basketball / total * 100).toFixed(0) : 50;
    const volleyballPercent = total > 0 ? (volleyball / total * 100).toFixed(0) : 50;

    return {
      basketball,
      volleyball,
      basketballPercent,
      volleyballPercent
    };
  }, [financialData.revenueBySport]);

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'green',
      'Failed': 'red',
      'Refunded': 'purple'
    };
    return colors[status] || 'gray';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'Paid': CheckCircle,
      'Failed': XCircle,
      'Refunded': Clock
    };
    return icons[status] || CheckCircle;
  };

  // Handle export CSV
  const handleExportCSV = () => {
    const csv = [
      ['Transaction ID', 'Date', 'User', 'Description', 'Amount', 'Status', 'Payment Method'],
      ...filteredTransactions.map(t => [
        t.id,
        formatDate(t.date),
        t.userName,
        t.description,
        t.amount,
        t.status,
        t.paymentMethod
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading financial data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-8 max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Data</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Financial Overview</h2>
          <p className="text-slate-600 mt-1">Revenue metrics, transactions, and financial reports</p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            {metrics.revenueGrowth >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-semibold">+{metrics.revenueGrowth}%</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-red-600 font-semibold">{metrics.revenueGrowth}%</span>
              </>
            )}
            <span className="text-slate-500 ml-1">from last period</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Monthly Recurring</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.mrr)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-500">
            {metrics.activeSubscriptions} active subscriptions
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Avg Revenue/User</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.arpu)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Per user per month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Lifetime Value</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(metrics.ltv)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-sm text-slate-500">
            12-month average
          </div>
        </Card>
      </div>

      {/* Revenue by Sport & Subscription Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Sport - Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue by Sport</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-48 h-48">
              {/* CSS Pie Chart */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    from 0deg,
                    #f97316 0% ${revenueBySport.basketballPercent}%,
                    #8b5cf6 ${revenueBySport.basketballPercent}% 100%
                  )`
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(metrics.totalRevenue)}
                      </p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="font-semibold text-slate-900">Basketball</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrency(revenueBySport.basketball)}</p>
                <p className="text-sm text-slate-600">{revenueBySport.basketballPercent}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="font-semibold text-slate-900">Volleyball</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{formatCurrency(revenueBySport.volleyball)}</p>
                <p className="text-sm text-slate-600">{revenueBySport.volleyballPercent}%</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Subscription Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Transaction Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Successful Payments</p>
                  <p className="text-sm text-slate-600">{metrics.paidCount} transactions</p>
                </div>
              </div>
              <p className="text-xl font-bold text-green-600">
                {filteredTransactions.length > 0 ? ((metrics.paidCount / filteredTransactions.length) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Failed Payments</p>
                  <p className="text-sm text-slate-600">{metrics.failedCount} transactions</p>
                </div>
              </div>
              <p className="text-xl font-bold text-red-600">
                {filteredTransactions.length > 0 ? ((metrics.failedCount / filteredTransactions.length) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Refunded</p>
                  <p className="text-sm text-slate-600">{metrics.refundedCount} transactions</p>
                </div>
              </div>
              <p className="text-xl font-bold text-purple-600">
                {filteredTransactions.length > 0 ? ((metrics.refundedCount / filteredTransactions.length) * 100).toFixed(1) : '0.0'}%
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
              <div>
                <p className="font-semibold text-slate-900">Total Transactions</p>
                <p className="text-sm text-slate-600">Filtered results</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Transaction History</h3>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Failed', label: 'Failed' },
                { value: 'Refunded', label: 'Refunded' }
              ]}
            />

            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'quarter', label: 'Last Quarter' }
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Transaction ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Description</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Amount</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">No transactions found</p>
                    <p className="text-sm mt-1">
                      {mappedTransactions.length === 0
                        ? 'No transaction data available yet'
                        : 'Try adjusting your filters'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.slice(0, 50).map((txn, index) => {
                  const StatusIcon = getStatusIcon(txn.status);
                  return (
                    <tr
                      key={txn.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="p-4">
                        <p className="text-sm font-mono font-semibold text-slate-900">{txn.id}</p>
                      </td>

                      <td className="p-4">
                        <p className="text-sm text-slate-600">{formatDate(txn.date)}</p>
                      </td>

                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900">{txn.userName}</p>
                      </td>

                      <td className="p-4">
                        <p className="text-sm text-slate-600">{txn.description}</p>
                      </td>

                      <td className="p-4">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(txn.amount)}</p>
                      </td>

                      <td className="p-4">
                        <Badge color={getStatusColor(txn.status)}>
                          <StatusIcon className="w-3 h-3 mr-1 inline" />
                          {txn.status}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <p className="text-sm font-mono text-slate-600">{txn.paymentMethod}</p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {filteredTransactions.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{Math.min(50, filteredTransactions.length)}</span> of{' '}
              <span className="font-semibold">{filteredTransactions.length}</span> transactions
              {filteredTransactions.length > 50 && (
                <span className="ml-2 text-orange-600">(Displaying first 50)</span>
              )}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default FinancialTab;
