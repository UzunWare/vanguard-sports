import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Users, DollarSign, Megaphone, LogOut } from 'lucide-react';
import OverviewTab from './tabs/OverviewTab';
import SessionsTab from './tabs/SessionsTab';
import UsersTab from './tabs/UsersTab';
import FinancialTab from './tabs/FinancialTab';
import AnnouncementsTab from './tabs/AnnouncementsTab';

/**
 * AdminDashboard Component
 * Super Admin dashboard with full platform control
 */
const AdminDashboard = ({ user, logoutUser, sessions, onUpdateSessions, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Navigation items
  const navItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'sessions', icon: Calendar, label: 'Sessions' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'financial', icon: DollarSign, label: 'Financial' },
    { id: 'announcements', icon: Megaphone, label: 'Announcements' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex animate-fade-in">
      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-64 bg-slate-900 text-slate-400 flex flex-col flex-shrink-0 transition-all duration-300">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold flex-shrink-0">
            V
          </div>
          <span className="ml-3 font-bold text-white hidden lg:block">ADMIN PORTAL</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium hidden lg:block">{item.label}</span>
            </button>
          ))}
          {onNavigate && (
            <button
              onClick={() => onNavigate('calendar')}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all"
            >
              <Calendar size={20} />
              <span className="font-medium hidden lg:block">Full Calendar</span>
            </button>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logoutUser}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors text-slate-400"
          >
            <LogOut size={20} />
            <span className="font-medium hidden lg:block">Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-slate-900">{user.name}</div>
              <div className="text-xs text-slate-500">Super Admin</div>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold border-2 border-red-200">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeTab === 'overview' && <OverviewTab onNavigateToTab={setActiveTab} sessions={sessions} />}
          {activeTab === 'sessions' && (
            <SessionsTab
              onNavigateToTab={setActiveTab}
              sessions={sessions}
              onUpdateSessions={onUpdateSessions}
            />
          )}
          {activeTab === 'users' && (
            <UsersTab onNavigateToTab={setActiveTab} />
          )}
          {activeTab === 'financial' && (
            <FinancialTab onNavigateToTab={setActiveTab} />
          )}
          {activeTab === 'announcements' && (
            <AnnouncementsTab onNavigateToTab={setActiveTab} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
