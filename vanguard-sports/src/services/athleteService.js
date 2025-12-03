import apiClient from './api';

/**
 * Athlete Service
 * Handles all athlete-related API calls
 */

export const athleteService = {
  /**
   * Get all athletes for current parent
   */
  async getMyAthletes() {
    return apiClient.get('/athletes/my-athletes');
  },

  /**
   * Get athlete by ID
   */
  async getAthleteById(id) {
    return apiClient.get(`/athletes/${id}`);
  },

  /**
   * Create new athlete
   */
  async createAthlete(athleteData) {
    return apiClient.post('/athletes', {
      firstName: athleteData.firstName,
      lastName: athleteData.lastName,
      dateOfBirth: athleteData.dateOfBirth,
      gender: athleteData.gender,
      jerseySize: athleteData.jerseySize,
      relationship: athleteData.relationship,
      isPrimary: athleteData.isPrimary,
      allergies: athleteData.allergies,
      conditions: athleteData.conditions,
      medications: athleteData.medications,
    });
  },

  /**
   * Update athlete
   */
  async updateAthlete(id, athleteData) {
    return apiClient.patch(`/athletes/${id}`, {
      firstName: athleteData.firstName,
      lastName: athleteData.lastName,
      dateOfBirth: athleteData.dateOfBirth,
      gender: athleteData.gender,
      jerseySize: athleteData.jerseySize,
    });
  },

  /**
   * Update medical information
   */
  async updateMedicalInfo(id, medicalData) {
    return apiClient.patch(`/athletes/${id}/medical`, {
      allergies: medicalData.allergies,
      conditions: medicalData.conditions,
      medications: medicalData.medications,
    });
  },

  /**
   * Add emergency contact
   */
  async addEmergencyContact(athleteId, contactData) {
    return apiClient.post(`/athletes/${athleteId}/emergency-contacts`, {
      name: contactData.name,
      phone: contactData.phone,
      relationship: contactData.relationship,
      isPrimary: contactData.isPrimary,
    });
  },

  /**
   * Remove emergency contact
   */
  async removeEmergencyContact(athleteId, contactId) {
    return apiClient.delete(`/athletes/${athleteId}/emergency-contacts/${contactId}`);
  },

  /**
   * Delete athlete
   */
  async deleteAthlete(id) {
    return apiClient.delete(`/athletes/${id}`);
  },
};

export default athleteService;
