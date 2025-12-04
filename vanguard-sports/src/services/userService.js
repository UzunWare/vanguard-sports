import apiClient from './api';

/**
 * User Service
 * Handles all user-related API calls
 */

export const userService = {
  /**
   * Get current user profile
   */
  async getProfile() {
    return apiClient.get('/users/me');
  },

  /**
   * Update current user profile
   */
  async updateProfile(profileData) {
    const response = await apiClient.patch('/users/me', profileData);

    // Update stored user data
    if (response.user) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...response.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    return response;
  },

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId) {
    return apiClient.get(`/users/${userId}`);
  },

  /**
   * Get all users (admin only)
   */
  async getAllUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return apiClient.get(`/users${queryParams ? `?${queryParams}` : ''}`);
  },

  /**
   * Update user by ID (admin only)
   */
  async updateUser(userId, userData) {
    return apiClient.patch(`/users/${userId}`, userData);
  },

  /**
   * Suspend user account (admin only)
   */
  async suspendUser(userId) {
    return apiClient.patch(`/users/${userId}/suspend`);
  },

  /**
   * Activate user account (admin only)
   */
  async activateUser(userId) {
    return apiClient.patch(`/users/${userId}/activate`);
  },

  /**
   * Delete user account (admin only)
   */
  async deleteUser(userId) {
    return apiClient.delete(`/users/${userId}`);
  },
};

export default userService;
