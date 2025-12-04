import React, { useState, useEffect } from 'react';
import {
  Send,
  Megaphone,
  Users,
  Clock,
  Loader,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Input, Select } from '../../../components/ui';
import { announcementService } from '../../../services/announcementService';
import { formatDate } from '../../../utils/formatters';

/**
 * AnnouncementsTab
 * Admin interface for creating and managing announcements
 */
const AnnouncementsTab = () => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notification, setNotification] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'all',
  });

  // Fetch announcements history
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementService.getAnnouncements(20);
      setAnnouncements(data);
    } catch (error) {
      showNotification('Failed to load announcement history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.message.trim()) {
      showNotification('Please fill in all fields', 'error');
      return;
    }

    try {
      setSending(true);
      const result = await announcementService.createAnnouncement(formData);

      showNotification(
        `Announcement sent successfully to ${result.recipientCount} parent${result.recipientCount !== 1 ? 's' : ''}!`,
        'success'
      );

      // Reset form
      setFormData({
        title: '',
        message: '',
        targetAudience: 'all',
      });

      // Refresh announcements
      fetchAnnouncements();
    } catch (error) {
      showNotification(error.message || 'Failed to send announcement', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-2xl animate-fade-in flex items-center gap-3 ${
            notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-green-500 text-white'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
        <p className="text-slate-600 mt-1">
          Send announcements and updates to all parents
        </p>
      </div>

      {/* Create Announcement Form */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create Announcement</h3>
            <p className="text-sm text-slate-600">Compose and send to all parents</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Announcement Title *
            </label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Session Schedule Update"
              required
              disabled={sending}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Send To
            </label>
            <Select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              disabled={sending}
              options={[
                { value: 'all', label: 'All Parents' },
              ]}
            />
            <p className="text-xs text-slate-500 mt-1">
              <Users className="w-3 h-3 inline mr-1" />
              This will send emails to all registered parents
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your announcement message here..."
              required
              disabled={sending}
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Be clear and concise. Parents will receive this via email.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={sending}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {sending ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Announcement
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Announcement History */}
      <Card>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Announcements</h3>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock size={16} />
              <span>Last {announcements.length} announcements</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-12 text-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading announcements...</p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Megaphone className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-semibold">No announcements yet</p>
              <p className="text-sm mt-1">Create your first announcement above</p>
            </div>
          ) : (
            announcements.map((announcement, index) => (
              <div
                key={announcement.id}
                className={`p-6 hover:bg-slate-50 transition-colors ${
                  index === 0 ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 mb-1">
                      {announcement.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {announcement.senderName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      Latest
                    </span>
                  )}
                </div>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {announcement.message}
                </p>
                {announcement.sessionInfo && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-700">
                    <span className="font-semibold">Session:</span>
                    {announcement.sessionInfo}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default AnnouncementsTab;
