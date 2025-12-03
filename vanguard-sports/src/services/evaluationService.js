import apiClient from './api';

/**
 * Evaluation Service
 * Handles all evaluation-related API calls
 */

export const evaluationService = {
  /**
   * Get evaluations (role-filtered)
   */
  async getEvaluations(filters = {}) {
    const params = new URLSearchParams();
    if (filters.athleteId) params.append('athleteId', filters.athleteId);
    if (filters.sessionId) params.append('sessionId', filters.sessionId);

    const queryString = params.toString();
    const endpoint = queryString ? `/evaluations?${queryString}` : '/evaluations';

    return apiClient.get(endpoint);
  },

  /**
   * Get evaluation by ID
   */
  async getEvaluationById(id) {
    return apiClient.get(`/evaluations/${id}`);
  },

  /**
   * Create evaluation (coach/admin only)
   */
  async createEvaluation(evaluationData) {
    return apiClient.post('/evaluations', {
      athleteId: evaluationData.athleteId,
      sessionId: evaluationData.sessionId,
      evaluationDate: evaluationData.evaluationDate,
      notes: evaluationData.notes,
      ratings: evaluationData.ratings,
    });
  },

  /**
   * Update evaluation (coach/admin only)
   */
  async updateEvaluation(id, evaluationData) {
    return apiClient.patch(`/evaluations/${id}`, {
      evaluationDate: evaluationData.evaluationDate,
      notes: evaluationData.notes,
      ratings: evaluationData.ratings,
    });
  },

  /**
   * Delete evaluation (coach/admin only)
   */
  async deleteEvaluation(id) {
    return apiClient.delete(`/evaluations/${id}`);
  },
};

export default evaluationService;
