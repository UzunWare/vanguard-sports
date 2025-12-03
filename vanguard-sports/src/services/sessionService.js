import apiClient from './api';

/**
 * Session Service
 * Handles all session-related API calls
 */

export const sessionService = {
  /**
   * Get all sessions
   */
  async getAllSessions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.sport) params.append('sport', filters.sport);
    if (filters.status) params.append('status', filters.status);
    if (filters.day) params.append('day', filters.day);

    const queryString = params.toString();
    const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';

    return apiClient.get(endpoint, { skipAuth: true });
  },

  /**
   * Get session by ID
   */
  async getSessionById(id) {
    return apiClient.get(`/sessions/${id}`, { skipAuth: true });
  },

  /**
   * Create session (admin only)
   */
  async createSession(sessionData) {
    return apiClient.post('/sessions', {
      sport: sessionData.sport,
      level: sessionData.level,
      grades: sessionData.grades,
      gender: sessionData.gender,
      minAge: sessionData.minAge,
      maxAge: sessionData.maxAge,
      dayOfWeek: sessionData.dayOfWeek,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      durationMinutes: sessionData.durationMinutes,
      location: sessionData.location,
      capacity: sessionData.capacity,
      price: sessionData.price,
      registrationFee: sessionData.registrationFee,
      headCoachId: sessionData.headCoachId,
      assistantCoachId: sessionData.assistantCoachId,
      description: sessionData.description,
      status: sessionData.status,
      features: sessionData.features,
    });
  },

  /**
   * Update session (admin only)
   */
  async updateSession(id, sessionData) {
    return apiClient.patch(`/sessions/${id}`, sessionData);
  },

  /**
   * Delete session (admin only)
   */
  async deleteSession(id) {
    return apiClient.delete(`/sessions/${id}`);
  },
};

export default sessionService;
