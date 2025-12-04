import apiClient from './api';

/**
 * Announcement Service
 * Handles all announcement-related API calls
 */

export const announcementService = {
  /**
   * Create and send announcement
   */
  async createAnnouncement(announcementData) {
    const response = await apiClient.post('/announcements', announcementData);
    return response;
  },

  /**
   * Get announcement history
   */
  async getAnnouncements(limit = 50) {
    const response = await apiClient.get(`/announcements?limit=${limit}`);
    return response.announcements;
  },

  /**
   * Get coach's sessions for targeting
   */
  async getCoachSessions() {
    const response = await apiClient.get('/announcements/coach-sessions');
    return response.sessions;
  },
};

export default announcementService;
