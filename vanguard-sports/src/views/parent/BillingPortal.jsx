import React, { useState, useEffect } from 'react';
import { ChevronRight, CreditCard, Download, Check, Loader, Plus, Trash2, Star, Search, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatCurrency, formatDate, maskCardNumber } from '../../utils/formatters';
import billingService from '../../services/billingService';

/**
 * BillingPortal Component
 * Manage invoices, payment methods, and billing information
 */
const BillingPortal = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState('invoices'); // invoices | payment-methods
  const [invoices, setInvoices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [methodToRemove, setMethodToRemove] = useState(null);

  // Load real billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      try {
        const invoiceData = await billingService.getMyInvoices();
        setInvoices(invoiceData);

        // Payment methods will come from Stripe integration later
        // For now, show empty state
        setPaymentMethods([]);
      } catch (error) {
        console.error('Failed to load billing data:', error);
        showNotificationMessage('Failed to load billing data');
        setInvoices([]);
        setPaymentMethods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const showNotificationMessage = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle invoice download
  const handleDownload = (invoiceId) => {
    showNotificationMessage(`Downloading invoice ${invoiceId}...`);
    // Simulated download
  };

  // Handle set default payment method
  const handleSetDefault = (methodId) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === methodId
    })));
    showNotificationMessage('Default payment method updated');
  };

  // Handle remove payment method
  const handleRemoveMethodClick = (methodId) => {
    setMethodToRemove(methodId);
    setShowRemoveDialog(true);
  };

  const handleRemoveMethodConfirm = () => {
    if (methodToRemove) {
      setPaymentMethods(prev => prev.filter(pm => pm.id !== methodToRemove));
      showNotificationMessage('Payment method removed successfully');
      setMethodToRemove(null);
    }
  };

  // Handle add payment method
  const handleAddCard = () => {
    setShowAddCardModal(true);
  };

  // Get card type icon color
  const getCardColor = (type) => {
    const colors = {
      'Visa': 'text-blue-600',
      'Mastercard': 'text-orange-600',
      'Amex': 'text-green-600',
      'Discover': 'text-purple-600'
    };
    return colors[type] || 'text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3">
            <Check className="text-green-400" size={20} /> {notification}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Billing Portal</h1>
            <p className="text-slate-500 text-sm mt-1">
              View invoices, manage payment methods, and billing information
            </p>
          </div>
        </div>

        {/* Billing Overview Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-none">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-orange-100 text-sm font-semibold mb-1">Current Balance</p>
              <p className="text-3xl font-bold">${user.subscription?.amount || '0.00'}</p>
            </div>
            <div>
              <p className="text-orange-100 text-sm font-semibold mb-1">Next Payment</p>
              <p className="text-xl font-bold">{user.subscription?.nextPayment || 'N/A'}</p>
            </div>
            <div>
              <p className="text-orange-100 text-sm font-semibold mb-1">Auto-Renewal</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-6 bg-white/20 rounded-full flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full shadow-md transform translate-x-4"></div>
                </div>
                <span className="text-sm font-semibold">Enabled</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Invoice History
          </button>
          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'payment-methods'
                ? 'border-b-2 border-orange-600 text-orange-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Payment Methods
          </button>
        </div>

        {/* Invoice History Tab */}
        {activeTab === 'invoices' && (
          <Card className="p-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={Search}
                />
              </div>
              <div className="sm:w-48">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 appearance-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <Filter className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton variant="table" rows={5} />
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Download size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-slate-600 mb-2">No invoices found</p>
                <p className="text-sm">Try adjusting your search or filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-4 text-left">Invoice ID</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">Description</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-xs font-semibold text-slate-700">
                          {invoice.id}
                        </td>
                        <td className="p-4 text-slate-600">{invoice.date}</td>
                        <td className="p-4 text-slate-900">{invoice.description}</td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="p-4 text-center">
                          <Badge
                            color={
                              invoice.status === 'Paid' ? 'green' :
                              invoice.status === 'Failed' ? 'red' : 'yellow'
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDownload(invoice.id)}
                            className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-semibold text-sm"
                          >
                            <Download size={14} /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-xs text-slate-500 text-center">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>
          </Card>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
          <div className="space-y-6">
            {loading ? (
              <LoadingSkeleton variant="card" count={2} />
            ) : (
              <>
                {/* Payment Methods List */}
                {paymentMethods.map((method) => (
                  <Card key={method.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center ${getCardColor(method.type)}`}>
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-slate-900">{method.type}</p>
                            {method.isDefault && (
                              <Badge color="green">
                                <Star size={10} fill="currentColor" className="inline mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 font-mono">
                            •••• •••• •••• {method.last4}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            onClick={() => handleSetDefault(method.id)}
                            className="text-sm h-9 px-4"
                          >
                            Set as Default
                          </Button>
                        )}
                        <button
                          onClick={() => handleRemoveMethodClick(method.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove card"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}

                {/* Add Payment Method Card */}
                <Card className="p-8 border-2 border-dashed border-slate-300 hover:border-orange-400 transition-colors cursor-pointer group">
                  <button
                    onClick={handleAddCard}
                    className="w-full flex flex-col items-center justify-center gap-3 text-slate-500 group-hover:text-orange-600"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                      <Plus size={32} />
                    </div>
                    <p className="font-bold text-lg">Add New Payment Method</p>
                    <p className="text-sm">Connect a new credit or debit card</p>
                  </button>
                </Card>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Card Modal (simplified - would integrate with PaymentModal) */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add Payment Method</h2>
            <p className="text-slate-600 mb-4">This feature will integrate with your payment processor (Stripe, etc.)</p>
            <div className="flex gap-3">
              <Button onClick={() => {
                setShowAddCardModal(false);
                showNotificationMessage('Payment method feature coming soon!');
              }}>
                Continue
              </Button>
              <Button variant="ghost" onClick={() => setShowAddCardModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Payment Method Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveDialog}
        onClose={() => {
          setShowRemoveDialog(false);
          setMethodToRemove(null);
        }}
        onConfirm={handleRemoveMethodConfirm}
        title="Remove Payment Method"
        message="Are you sure you want to remove this payment method? This action cannot be undone."
        confirmText="Yes, Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default BillingPortal;
