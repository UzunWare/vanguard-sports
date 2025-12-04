import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Activity, Calendar, Plus, FileText, Settings, Mail, UserPlus, CreditCard, XCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { formatCurrency } from '../../../utils/formatters';
import adminService from '../../../services/adminService';

/**
 * OverviewTab Component
 * Admin dashboard overview with metrics, charts, and activity feed
 */
const OverviewTab = ({ onNavigateToTab, sessions = [] }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculate metrics from real session data
  const metrics = useMemo(() => {
    const totalAthletes = sessions.reduce((sum, session) => sum + (session.registeredCount || 0), 0);
    const totalRevenue = sessions.reduce((sum, session) => {
      const enrollments = session.registeredCount || 0;
      return sum + (enrollments * (session.price + session.regFee));
    }, 0);

    return {
      totalRevenue,
      revenueGrowth: 0,
      activeSubscriptions: totalAthletes,
      newSubscriptionsThisWeek: 0,
      totalAthletes,
      totalSessions: sessions.length,
      churnRate: 0,
      churnChange: 0,
      pendingApprovals: 0
    };
  }, [sessions]);

  // Fetch monthly revenue trend data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const trend = await adminService.getMonthlyRevenueTrend();

        // Transform backend data to frontend format
        if (trend && Array.isArray(trend)) {
          const maxRevenue = Math.max(...trend.map(t => t.revenue));
          const transformedData = trend.map(item => ({
            month: item.month_label || item.month, // e.g., "Jan", "Feb"
            amount: item.revenue || 0,
            percentage: maxRevenue > 0 ? Math.round((item.revenue / maxRevenue) * 100) : 0
          }));
          setRevenueData(transformedData);
        }

        // Activities will be fetched from activity tracking endpoint (TODO)
        setActivities([]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setRevenueData([]);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Get activity icon
  const getActivityIcon = (iconName) => {
    const icons = {
      UserPlus,
      CreditCard,
      XCircle,
      Calendar
    };
    return icons[iconName] || Activity;
  };

  // Get activity color classes
  const getActivityColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={24} />
            <Badge color="green" className="bg-white/20 text-white border-transparent">
              Revenue
            </Badge>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
          <div className="text-emerald-100 text-sm mt-1 flex items-center gap-1">
            <TrendingUp size={14} />
            +{metrics.revenueGrowth}% from last month
          </div>
        </Card>

        {/* Active Subscriptions Card */}
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <Users size={24} />
            <Badge color="blue" className="bg-white/20 text-white border-transparent">
              Subscriptions
            </Badge>
          </div>
          <div className="text-3xl font-bold">{metrics.activeSubscriptions}</div>
          <div className="text-blue-100 text-sm mt-1">
            {metrics.newSubscriptionsThisWeek} new this week
          </div>
        </Card>

        {/* Total Athletes Card */}
        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={24} />
            <Badge color="purple" className="bg-white/20 text-white border-transparent">
              Athletes
            </Badge>
          </div>
          <div className="text-3xl font-bold">{metrics.totalAthletes}</div>
          <div className="text-purple-100 text-sm mt-1">
            Across {metrics.totalSessions} sessions
          </div>
        </Card>

        {/* Churn Rate Card */}
        <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white border-none hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-2">
            <Activity size={24} />
            <Badge color="red" className="bg-white/20 text-white border-transparent">
              Churn
            </Badge>
          </div>
          <div className="text-3xl font-bold">{metrics.churnRate}%</div>
          <div className="text-orange-100 text-sm mt-1 flex items-center gap-1">
            <TrendingUp size={14} className="rotate-180" />
            {Math.abs(metrics.churnChange)}% from last month
          </div>
        </Card>
      </div>

      {/* Revenue Chart and Activity Feed */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Monthly Revenue Trend</h3>
          {revenueData.length > 0 ? (
            <div className="space-y-3">
              {revenueData.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <span className="w-12 text-sm font-semibold text-slate-600">{month.month}</span>
                  <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden relative group">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${month.percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatCurrency(month.amount)}
                      </span>
                    </div>
                  </div>
                  <span className="w-24 text-right font-bold text-slate-900 text-sm">
                    {formatCurrency(month.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <TrendingUp size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No revenue data available yet</p>
              <p className="text-xs mt-1">Data will appear as enrollments are processed</p>
            </div>
          )}
        </Card>

        {/* Recent Activity Feed */}
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">Recent Activity</h3>
          {activities.length > 0 ? (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.icon);
                const colorClass = getActivityColor(activity.color);

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">{activity.message}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Activity size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No recent activity</p>
              <p className="text-xs mt-1">Activity will appear as users interact with the platform</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-bold text-slate-900 mb-4 text-lg">Quick Actions</h3>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => onNavigateToTab && onNavigateToTab('sessions')}
          >
            <Plus size={24} className="text-orange-600" />
            <span className="text-sm font-semibold">Create Session</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => onNavigateToTab && onNavigateToTab('users')}
          >
            <UserPlus size={24} className="text-blue-600" />
            <span className="text-sm font-semibold">Add User</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => onNavigateToTab && onNavigateToTab('financial')}
          >
            <FileText size={24} className="text-green-600" />
            <span className="text-sm font-semibold">View Reports</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            onClick={() => onNavigateToTab && onNavigateToTab('users')}
          >
            <Users size={24} className="text-purple-600" />
            <span className="text-sm font-semibold">Manage Coaches</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            disabled
          >
            <Mail size={24} className="text-slate-400" />
            <span className="text-sm font-semibold">Send Announcement</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4"
            disabled
          >
            <Settings size={24} className="text-slate-400" />
            <span className="text-sm font-semibold">System Settings</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OverviewTab;
