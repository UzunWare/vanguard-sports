import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  UserCheck
} from 'lucide-react';
import { Card, Badge, Button, Input, Select } from '../../../components/ui';
import { formatCurrency } from '../../../utils/formatters';
import { SESSIONS_DATA } from '../../../data/sessions';
import SessionModal from '../components/SessionModal';

/**
 * SessionsTab
 * Comprehensive session management interface for admins
 * - View all training sessions
 * - Search and filter capabilities
 * - CRUD operations (Create, Edit, Delete, Duplicate)
 * - Session statistics overview
 */
const SessionsTab = ({ onNavigateToTab, sessions = SESSIONS_DATA, onUpdateSessions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [coachFilter, setCoachFilter] = useState('all');
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(null);

  // Extract unique coaches for filter
  const coaches = useMemo(() => {
    const coachSet = new Set();
    sessions.forEach(session => {
      if (session.headCoach) coachSet.add(session.headCoach);
      if (session.assistantCoach) coachSet.add(session.assistantCoach);
    });
    return Array.from(coachSet).sort();
  }, [sessions]);

  // Filter sessions based on search and filters
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        session.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.sport.toLowerCase().includes(searchQuery.toLowerCase());

      // Sport filter
      const matchesSport = sportFilter === 'all' || session.sport === sportFilter;

      // Status filter
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter;

      // Coach filter
      const matchesCoach = coachFilter === 'all' ||
        session.headCoach === coachFilter ||
        session.assistantCoach === coachFilter;

      return matchesSearch && matchesSport && matchesStatus && matchesCoach;
    });
  }, [sessions, searchQuery, sportFilter, statusFilter, coachFilter]);

  // Calculate session statistics
  const stats = useMemo(() => {
    const totalEnrolled = sessions.reduce((sum, s) => sum + s.registeredCount, 0);
    const totalCapacity = sessions.reduce((sum, s) => sum + s.capacity, 0);
    const avgCapacity = totalCapacity > 0 ? ((totalEnrolled / totalCapacity) * 100).toFixed(1) : 0;

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter(s => s.status === 'Open' || s.status === 'Limited').length,
      totalEnrolled,
      avgCapacity
    };
  }, [sessions]);

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      'Open': 'green',
      'Limited': 'yellow',
      'Waitlist Soon': 'orange',
      'Full': 'blue',
      'Archived': 'gray'
    };
    return colors[status] || 'gray';
  };

  // Handle session actions
  const handleEditSession = (session) => {
    setEditingSession(session);
    setShowSessionModal(true);
    setShowActionMenu(null);
  };

  const handleDuplicateSession = (session) => {
    const duplicated = {
      ...session,
      id: `${session.id}-copy-${Date.now()}`,
      level: `${session.level} (Copy)`,
      status: 'Open',
      registeredCount: 0
    };

    if (onUpdateSessions) {
      onUpdateSessions([...sessions, duplicated]);
    }

    setShowActionMenu(null);
  };

  const handleArchiveSession = (sessionId) => {
    if (onUpdateSessions) {
      const updated = sessions.map(s =>
        s.id === sessionId ? { ...s, status: 'Archived' } : s
      );
      onUpdateSessions(updated);
    }
    setShowArchiveConfirm(null);
    setShowActionMenu(null);
  };

  const handleDeleteSession = (sessionId) => {
    if (onUpdateSessions) {
      const updated = sessions.filter(s => s.id !== sessionId);
      onUpdateSessions(updated);
    }
    setShowDeleteConfirm(null);
    setShowActionMenu(null);
  };

  const handleCreateSession = () => {
    setEditingSession(null);
    setShowSessionModal(true);
  };

  const handleSaveSession = (sessionData) => {
    if (editingSession) {
      // Update existing session
      if (onUpdateSessions) {
        const updated = sessions.map(s =>
          s.id === sessionData.id ? sessionData : s
        );
        onUpdateSessions(updated);
      }
    } else {
      // Create new session
      if (onUpdateSessions) {
        onUpdateSessions([...sessions, sessionData]);
      }
    }

    setShowSessionModal(false);
    setEditingSession(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Session Management</h2>
          <p className="text-slate-600 mt-1">Create, edit, and manage all training sessions</p>
        </div>
        <Button onClick={handleCreateSession}>
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Session Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Total Sessions</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-900">{stats.activeSessions}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Total Enrolled</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalEnrolled}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-600 mb-1">Avg Capacity</p>
              <p className="text-3xl font-bold text-slate-900">{stats.avgCapacity}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search */}
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          {/* Sport Filter */}
          <Select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Sports' },
              { value: 'Basketball', label: 'Basketball' },
              { value: 'Volleyball', label: 'Volleyball' }
            ]}
          />

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Open', label: 'Open' },
              { value: 'Limited', label: 'Limited' },
              { value: 'Waitlist Soon', label: 'Waitlist Soon' },
              { value: 'Full', label: 'Full' },
              { value: 'Archived', label: 'Archived' }
            ]}
          />

          {/* Coach Filter */}
          <Select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Coaches' },
              ...coaches.map(coach => ({ value: coach, label: coach }))
            ]}
          />
        </div>
      </Card>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Session</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Sport</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Schedule</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Coach</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Capacity</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Price</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-12 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-semibold">No sessions found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or create a new session</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, index) => {
                  // Determine if menu should open upward (for items in bottom half)
                  const shouldOpenUpward = index >= Math.floor(filteredSessions.length / 2);

                  return (
                  <tr
                    key={session.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    }`}
                  >
                    {/* Session Name */}
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-900">{session.level}</p>
                        <p className="text-sm text-slate-500">{session.grades}</p>
                      </div>
                    </td>

                    {/* Sport */}
                    <td className="p-4">
                      <Badge color={session.sport === 'Basketball' ? 'orange' : 'blue'}>
                        {session.sport}
                      </Badge>
                    </td>

                    {/* Schedule */}
                    <td className="p-4">
                      <div className="flex items-center text-sm text-slate-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <div>
                          <p>{session.date.replace('Every ', '')}</p>
                          <p className="text-xs text-slate-500">{session.time}</p>
                        </div>
                      </div>
                    </td>

                    {/* Coach */}
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{session.headCoach}</p>
                        {session.assistantCoach && (
                          <p className="text-xs text-slate-500">{session.assistantCoach}</p>
                        )}
                      </div>
                    </td>

                    {/* Capacity */}
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {session.registeredCount} / {session.capacity}
                        </p>
                        <div className="w-24 h-2 bg-slate-200 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              (session.registeredCount / session.capacity) >= 0.9
                                ? 'bg-red-500'
                                : (session.registeredCount / session.capacity) >= 0.7
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min((session.registeredCount / session.capacity) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(session.price)}/mo
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <Badge color={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionMenu(showActionMenu === session.id ? null : session.id);
                          }}
                          className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-600" />
                        </button>

                        {/* Action Menu Dropdown */}
                        {showActionMenu === session.id && (
                          <>
                            {/* Backdrop to close menu when clicking outside */}
                            <div
                              className="fixed inset-0 z-[100]"
                              onClick={() => setShowActionMenu(null)}
                            />
                            <div className={`absolute right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-[110] ${
                              shouldOpenUpward ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                              <button
                                onClick={() => handleEditSession(session)}
                                className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors rounded-t-lg"
                              >
                                <Edit className="w-4 h-4 mr-3" />
                                Edit Session
                              </button>
                              <button
                                onClick={() => handleDuplicateSession(session)}
                                className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors"
                              >
                                <Copy className="w-4 h-4 mr-3" />
                                Duplicate
                              </button>
                              {session.status !== 'Archived' && (
                                <button
                                  onClick={() => setShowArchiveConfirm(session.id)}
                                  className="w-full flex items-center px-4 py-3 hover:bg-slate-50 text-left text-sm text-slate-700 transition-colors"
                                >
                                  <Archive className="w-4 h-4 mr-3" />
                                  Archive
                                </button>
                              )}
                              <button
                                onClick={() => setShowDeleteConfirm(session.id)}
                                className="w-full flex items-center px-4 py-3 hover:bg-red-50 text-left text-sm text-red-600 transition-colors border-t border-slate-100 rounded-b-lg"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Archive Session?</h3>
            <p className="text-slate-600 mb-6">
              Archiving this session will hide it from public view but preserve all data. Enrolled athletes will remain enrolled. You can restore it later if needed.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowArchiveConfirm(null)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleArchiveSession(showArchiveConfirm)}
                fullWidth
              >
                Archive Session
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Session?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this session? This action cannot be undone and will affect all enrolled athletes.
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
                onClick={() => handleDeleteSession(showDeleteConfirm)}
                fullWidth
              >
                Delete Session
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <SessionModal
          session={editingSession}
          onSave={handleSaveSession}
          onClose={() => {
            setShowSessionModal(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
};

export default SessionsTab;
