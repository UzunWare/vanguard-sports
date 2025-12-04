import apiClient from './api';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export const authService = {
  /**
   * Login user
   */
  async login(email, password) {
    const response = await apiClient.post(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    );

    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  /**
   * Register new user (parent)
   */
  async register(userData) {
    const response = await apiClient.post(
      '/auth/register',
      {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      },
      { skipAuth: true }
    );

    if (response.accessToken && response.refreshToken) {
      apiClient.setTokens(response.accessToken, response.refreshToken);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  },

  /**
   * Logout user
   */
  async logout() {
    const refreshToken = apiClient.getRefreshToken();

    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      // Silent fail - tokens will be cleared regardless
    } finally {
      apiClient.clearTokens();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * Refresh access token
   */
  async refreshToken() {
    const refreshToken = apiClient.getRefreshToken();
    const response = await apiClient.post(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true }
    );

    if (response.accessToken) {
      apiClient.setTokens(response.accessToken, null);
    }

    return response;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!apiClient.getToken();
  },

  /**
   * Get stored user data
   */
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
