import React, { useState, useMemo } from 'react';
import {
  Users as UsersIcon,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Key,
  Ban,
  CheckCircle,
  Trash2,
  Mail,
  Download
} from 'lucide-react';
import { Card, Badge, Button, Input, Select } from '../../../components/ui';
import { formatDate } from '../../../utils/formatters';
import { generateUsersList } from '../../../data/mockData';

/**
 * UsersTab
 * Comprehensive user management interface for admins
 * - View all users (parents, coaches, admins)
 * - Search and filter capabilities
 * - User status management (active/suspended/inactive)
 * - User actions (view, edit, suspend, delete)
 */
const UsersTab = ({ onNavigateToTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Generate mock users
  const [users, setUsers] = useState(() => generateUsersList(50));

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const now = new Date();
        const userDate = new Date(user.registered);
        const daysDiff = Math.floor((now - userDate) / (1000 * 60 * 60 * 24));

        if (dateFilter === 'week' && daysDiff > 7) matchesDate = false;
        if (dateFilter === 'month' && daysDiff > 30) matchesDate = false;
        if (dateFilter === 'year' && daysDiff > 365) matchesDate = false;
      }

      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });
  }, [users, searchQuery, roleFilter, statusFilter, dateFilter]);

  // Calculate user statistics
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      activeParents: users.filter(u => u.role === 'Parent' && u.status === 'Active').length,
      activeCoaches: users.filter(u => u.role === 'Coach' && u.status === 'Active').length,
      newThisMonth: users.filter(u => {
        const daysDiff = Math.floor((new Date() - new Date(u.registered)) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30;
      }).length
    };
  }, [users]);

  // Get role badge color
  const getRoleColor = (role) => {
    const colors = {
      'Parent': 'blue',
      'Coach': 'purple',
      'Admin': 'red'
    };
    return colors[role] || 'gray';
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Active': 'green',
      'Suspended': 'red',
      'Inactive': 'gray'
    };
    return colors[status] || 'gray';
  };

  // Handle user actions
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    setShowActionMenu(null);
  };

  const handleSuspendUser = (userId) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: 'Suspended' } : u
    ));
    setShowActionMenu(null);
  };

  const handleActivateUser = (userId) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, status: 'Active' } : u
    ));
    setShowActionMenu(null);
  };

  const handleResetPassword = (user) => {
    // Simulate password reset email
    alert(`Password reset email sent to ${user.email}`);
    setShowActionMenu(null);
  };

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setShowDeleteConfirm(null);
    setShowActionMenu(null);
  };

  const handleExportCSV = () => {
    // Simulate CSV export
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Registered', 'Subscriptions'],
      ...filteredUsers.map(u => [
        u.name,
        u.email,
        u.role,
        u.status,
        formatDate(u.registered),
        u.subscriptions || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-slate-600 mt-1">View, edit, and manage all platform users</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowUserModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* User Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Active Parents</p>
              <p className="text-3xl font-bold text-slate-900">{stats.activeParents}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Active Coaches</p>
              <p className="text-3xl font-bold text-slate-900">{stats.activeCoaches}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">New This Month</p>
              <p className="text-3xl font-bold text-slate-900">{stats.newThisMonth}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          {/* Role Filter */}
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'Parent', label: 'Parents' },
              { value: 'Coach', label: 'Coaches' },
              { value: 'Admin', label: 'Admins' }
            ]}
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Suspended', label: 'Suspended' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
          />

          {/* Date Filter */}
          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Time' },
              { value: 'week', label: 'Last Week' },
              { value: 'month', label: 'Last Month' },
              { value: 'year', label: 'Last Year' }
            ]}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Registered</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Subscriptions</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-12 text-slate-500">
                    <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or add a new user</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                    onClick={() => handleViewUser(user)}
                  >
                    {/* User */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                          user.status === 'Active' ? 'bg-green-500' :
                          user.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'
                        }`}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">
                            Last login: {formatDate(user.lastLogin)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-4">
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <Badge color={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <Badge color={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>

                    {/* Registered */}
                    <td className="p-4">
                      <p className="text-sm text-slate-600">{formatDate(user.registered)}</p>
                    </td>

                    {/* Subscriptions */}
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {user.subscriptions > 0 ? `${user.subscriptions} active` : '—'}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-600" />
                        </button>

                        {/* Action Menu Dropdown */}
                        {showActionMenu === user.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors"
                            >
                              <Edit className="w-4 h-4 mr-3" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors"
                            >
                              <Key className="w-4 h-4 mr-3" />
                              Reset Password
                            </button>
                            {user.status === 'Active' ? (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="w-full flex items-center px-4 py-3 hover:bg-orange-50 text-left text-sm text-orange-600 transition-colors"
                              >
                                <Ban className="w-4 h-4 mr-3" />
                                Suspend Account
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user.id)}
                                className="w-full flex items-center px-4 py-3 hover:bg-green-50 text-left text-sm text-green-600 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 mr-3" />
                                Activate Account
                              </button>
                            )}
                            <button
                              onClick={() => setShowDeleteConfirm(user.id)}
                              className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-left text-sm text-red-600 transition-colors border-t border-slate-100"
                            >
                              <Trash2 className="w-4 h-4 mr-3" />
                              Delete User
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {filteredUsers.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold">{users.length}</span> users
            </p>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete User?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this user? This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(null)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                fullWidth
              >
                Delete User
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* User Modal Placeholder */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                {selectedUser ? 'User Details' : 'Add New User'}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-xl ${
                    selectedUser.status === 'Active' ? 'bg-green-500' :
                    selectedUser.status === 'Suspended' ? 'bg-red-500' : 'bg-gray-400'
                  }`}>
                    {selectedUser.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{selectedUser.name}</h4>
                    <p className="text-sm text-slate-600">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge color={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                      <Badge color={getStatusColor(selectedUser.status)}>{selectedUser.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Registered</p>
                    <p className="font-semibold text-slate-900">{formatDate(selectedUser.registered)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Last Login</p>
                    <p className="font-semibold text-slate-900">{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Total Logins</p>
                    <p className="font-semibold text-slate-900">{selectedUser.loginCount}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Subscriptions</p>
                    <p className="font-semibold text-slate-900">
                      {selectedUser.subscriptions > 0 ? `${selectedUser.subscriptions} active` : 'None'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-500 italic">
                  Full user detail modal with tabs coming next!
                </p>
              </div>
            )}

            <Button
              onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
              }}
              fullWidth
              className="mt-6"
            >
              Close
            </Button>
          </Card>
        </div>
      )}

      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </div>
  );
};

export default UsersTab;
