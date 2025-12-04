import apiClient from './api';

/**
 * Enrollment Service
 * Handles all enrollment-related API calls
 */

export const enrollmentService = {
  /**
   * Get all enrollments for current parent
   */
  async getMyEnrollments() {
    return apiClient.get('/enrollments/my-enrollments');
  },

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id) {
    return apiClient.get(`/enrollments/${id}`);
  },

  /**
   * Create enrollment
   */
  async createEnrollment(enrollmentData) {
    return apiClient.post('/enrollments', {
      athleteId: enrollmentData.athleteId,
      sessionId: enrollmentData.sessionId,
      startDate: enrollmentData.startDate,
    });
  },

  /**
   * Cancel enrollment
   */
  async cancelEnrollment(id) {
    return apiClient.patch(`/enrollments/${id}/cancel`);
  },

  /**
   * Get session attendance (coach/admin)
   */
  async getSessionAttendance(sessionId, date = null) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/enrollments/sessions/${sessionId}/attendance?${queryString}`
      : `/enrollments/sessions/${sessionId}/attendance`;

    return apiClient.get(endpoint);
  },

  /**
   * Mark attendance (coach/admin)
   */
  async markAttendance(attendanceData) {
    return apiClient.post('/enrollments/attendance', {
      enrollmentId: attendanceData.enrollmentId,
      date: attendanceData.date,
      status: attendanceData.status,
      notes: attendanceData.notes,
    });
  },

  /**
   * Get enrollments for a session (coach/admin)
   */
  async getSessionEnrollments(sessionId) {
    return apiClient.get(`/enrollments/sessions/${sessionId}`);
  },

  /**
   * Get attendance history for an enrollment (coach/admin)
   */
  async getEnrollmentAttendanceHistory(enrollmentId) {
    return apiClient.get(`/enrollments/${enrollmentId}/attendance-history`);
  },
};

export default enrollmentService;
