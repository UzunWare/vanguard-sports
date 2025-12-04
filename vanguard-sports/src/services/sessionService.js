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

    const response = await apiClient.get(endpoint, { skipAuth: true });

    // Transform backend data to frontend format
    if (response.sessions) {
      response.sessions = response.sessions.map(session => ({
        id: session.id,
        sport: session.sport,
        level: session.level,
        grades: session.grades,
        gender: session.gender,
        minAge: session.min_age,
        maxAge: session.max_age,
        day_of_week: session.day_of_week, // Keep original for calendar
        date: `Every ${session.day_of_week}`,
        start_time: session.start_time, // Keep for calendar time display
        end_time: session.end_time, // Keep for calendar time display
        time: `${this._formatTime(session.start_time)} - ${this._formatTime(session.end_time)}`,
        duration: `${session.duration_minutes} min`,
        location: session.location,
        registeredCount: session.enrolled_count || 0,
        enrolled_count: session.enrolled_count || 0, // Keep for calendar
        capacity: session.capacity,
        status: session.status,
        price: session.price,
        regFee: session.registration_fee,
        headCoach: session.head_coach_name,
        head_coach_name: session.head_coach_name, // Keep for calendar
        coach_name: session.coach_name, // Keep for calendar
        assistantCoach: session.assistant_coach_name,
        description: session.description,
        features: session.features || []
      }));
    }

    return response;
  },

  _formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  /**
   * Get session by ID
   */
  async getSessionById(id) {
    const response = await apiClient.get(`/sessions/${id}`, { skipAuth: true });

    // Transform backend data to frontend format
    if (response.session) {
      const session = response.session;
      response.session = {
        id: session.id,
        sport: session.sport,
        level: session.level,
        grades: session.grades,
        gender: session.gender,
        minAge: session.min_age,
        maxAge: session.max_age,
        day_of_week: session.day_of_week, // Keep original for calendar
        date: `Every ${session.day_of_week}`,
        start_time: session.start_time, // Keep for calendar time display
        end_time: session.end_time, // Keep for calendar time display
        time: `${this._formatTime(session.start_time)} - ${this._formatTime(session.end_time)}`,
        duration: `${session.duration_minutes} min`,
        location: session.location,
        registeredCount: session.enrolled_count || 0,
        enrolled_count: session.enrolled_count || 0, // Keep for calendar
        capacity: session.capacity,
        status: session.status,
        price: session.price,
        regFee: session.registration_fee,
        headCoach: session.head_coach_name,
        head_coach_name: session.head_coach_name, // Keep for calendar
        coach_name: session.coach_name, // Keep for calendar
        assistantCoach: session.assistant_coach_name,
        description: session.description,
        features: session.features || []
      };
    }

    return response;
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
