import React, { useState } from 'react';
import { User, CreditCard, Users, LogOut, Check, RefreshCw, X, Settings, FileText, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

/**
 * ParentDashboard Component
 * Enhanced parent dashboard with navigation to all parent features
 */
const ParentDashboard = ({ user, logoutUser, onNavigate }) => {
  const [subStatus, setSubStatus] = useState(user.subscription?.status || 'Active');
  const [notification, setNotification] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const showNotificationMessage = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setSubStatus('Canceled');
    showNotificationMessage('Subscription cancelled successfully');
  };

  const handleResume = () => {
    setSubStatus('Active');
    showNotificationMessage('Subscription resumed');
  };

  // Quick action cards
  const quickActions = [
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Update profile and security settings',
      color: 'blue',
      action: () => onNavigate('accountSettings')
    },
    {
      icon: Users,
      title: 'Family Management',
      description: 'Manage athlete info and medical records',
      color: 'green',
      action: () => onNavigate('familyManagement')
    },
    {
      icon: CreditCard,
      title: 'Billing Portal',
      description: 'View invoices and payment methods',
      color: 'purple',
      action: () => onNavigate('billingPortal')
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
            {typeof notification === 'object' && notification.type === 'error' ? (
              <AlertTriangle className="text-red-400" size={20} />
            ) : typeof notification === 'object' && notification.type === 'warning' ? (
              <Info className="text-yellow-400" size={20} />
            ) : (
              <Check className="text-green-400" size={20} />
            )}
            {typeof notification === 'object' ? notification.message : notification}
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name?.split(' ')[0] || 'Parent'}!</h1>
            <p className="text-slate-500 mt-1">Manage your family's sports academy experience</p>
          </div>
          <Button variant="ghost" onClick={logoutUser}>
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>

        {/* Subscription Card */}
        <Card className={`p-6 border-l-4 mb-8 ${subStatus === 'Active' ? 'border-green-500' : 'border-red-500'}`}>
          <div className="flex justify-between items-start mb-6">
            <div>
              <Badge color={subStatus === 'Active' ? 'green' : 'red'} className="mb-2">
                {subStatus} Subscription
              </Badge>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{user.subscription?.program || 'Training Program'}</h2>
              <p className="text-slate-500 text-sm">
                Next billing: {subStatus === 'Active' ? user.subscription?.nextPayment || 'N/A' : 'N/A'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-slate-900">${user.subscription?.amount || '0'}</span>
              <span className="text-sm text-slate-500 block">/month</span>
            </div>
          </div>

          {/* Athletes */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <Users size={16} /> Your Athletes
            </h3>
            {user.students && user.students.length > 0 ? (
              user.students.map((student, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-orange-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                      {student.name ? student.name.charAt(0) : 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{student.name || 'Athlete'}</p>
                      <p className="text-xs text-slate-500">
                        {user.subscription?.program?.split(', ')[i] || user.subscription?.program || 'Program'} • Jersey: {student.jerseySize || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Badge color={subStatus === 'Active' ? 'green' : 'gray'}>
                    {subStatus === 'Active' ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No athletes registered</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4">
            {subStatus === 'Active' ? (
              <button
                onClick={handleCancelClick}
                className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} /> Cancel Subscription
              </button>
            ) : (
              <button
                onClick={handleResume}
                className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
              >
                <RefreshCw size={14} /> Resume Subscription
              </button>
            )}
            <button
              onClick={() => onNavigate('billingPortal')}
              className="text-sm font-medium text-slate-500 hover:text-orange-600 flex items-center gap-1 ml-auto"
            >
              <FileText size={14} /> View Billing
            </button>
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group border-t-4 border-t-transparent hover:border-t-orange-500"
                onClick={action.action}
              >
                <div className={`w-12 h-12 rounded-lg ${colorClasses[action.color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 flex items-center justify-between">
                  {action.title}
                  <ChevronRight size={18} className="text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-sm text-slate-500">{action.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-orange-600" />
              Need Help?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Contact our support team for any questions about your membership, billing, or athlete information.
            </p>
            <Button variant="outline" className="text-sm h-9" onClick={() => window.location.href = 'mailto:vanguardsportsacademytx@gmail.com'}>
              Contact Support
            </Button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Upcoming Sessions
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Next training session: Saturday at {user.subscription?.program?.includes('Basketball') ? '4:15 PM' : '10:30 AM'}
            </p>
            <Button variant="outline" className="text-sm h-9" onClick={() => onNavigate('calendar')}>
              View Schedule
            </Button>
          </Card>
        </div>
      </div>

      {/* Cancel Subscription Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your membership? This action will end your subscription at the end of the current billing period."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        variant="danger"
      />
    </div>
  );
};

export default ParentDashboard;
