/**
 * Base API Client
 * Handles all HTTP requests to the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.errorInterceptors = [];
    this.requestTimeout = 30000; // 30 seconds
  }

  /**
   * Register an error interceptor
   * @param {Function} interceptor - Function that receives error and returns modified error or handles it
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Call all registered error interceptors
   */
  async runErrorInterceptors(error) {
    let modifiedError = error;
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    return modifiedError;
  }

  getToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (token && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
      config.signal = controller.signal;

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 401 - try to refresh token
      if (response.status === 401 && !options.skipAuth && !endpoint.includes('/auth/refresh')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers.Authorization = `Bearer ${this.getToken()}`;
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), this.requestTimeout);
          config.signal = retryController.signal;

          const retryResponse = await fetch(url, config);
          clearTimeout(retryTimeoutId);
          return this.handleResponse(retryResponse);
        } else {
          // Refresh failed, clear tokens and redirect to login
          this.clearTokens();
          window.location.href = '/login';
          const error = new Error('Session expired. Please login again.');
          error.code = 'SESSION_EXPIRED';
          throw await this.runErrorInterceptors(error);
        }
      }

      return this.handleResponse(response);
    } catch (error) {
      // Handle different error types
      let apiError = error;

      if (error.name === 'AbortError') {
        apiError = new Error('Request timeout. Please check your connection and try again.');
        apiError.code = 'TIMEOUT';
      } else if (!navigator.onLine) {
        apiError = new Error('No internet connection. Please check your network.');
        apiError.code = 'NETWORK_ERROR';
      } else if (error.message === 'Failed to fetch') {
        apiError = new Error('Unable to reach the server. Please try again later.');
        apiError.code = 'SERVER_UNREACHABLE';
      }

      // Run error through interceptors
      const processedError = await this.runErrorInterceptors(apiError);

      throw processedError;
    }
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      // Create error with detailed information
      const errorMessage = data.error?.message || data.message || this.getStatusMessage(response.status);
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      error.code = this.getErrorCode(response.status);

      // Run through interceptors
      throw await this.runErrorInterceptors(error);
    }

    return data;
  }

  /**
   * Get user-friendly message based on HTTP status code
   */
  getStatusMessage(status) {
    const messages = {
      400: 'Invalid request. Please check your input.',
      401: 'Authentication required. Please log in.',
      403: 'Access denied. You do not have permission to perform this action.',
      404: 'Resource not found.',
      409: 'A conflict occurred. This resource may already exist.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please slow down and try again.',
      500: 'Internal server error. Please try again later.',
      502: 'Bad gateway. The server is temporarily unavailable.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. The request took too long.',
    };
    return messages[status] || 'An unexpected error occurred.';
  }

  /**
   * Get error code based on HTTP status
   */
  getErrorCode(status) {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, null);
        return true;
      }
      return false;
    } catch (error) {
      // Silent fail - return false to indicate refresh failed
      return false;
    }
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;

/**
 * Usage Example: Register a global error interceptor
 *
 * apiClient.addErrorInterceptor(async (error) => {
 *   // Log to external service (e.g., Sentry)
 *   if (import.meta.env.PROD && error.status >= 500) {
 *     // Sentry.captureException(error);
 *   }
 *
 *   // Show user-friendly notification
 *   if (error.code === 'NETWORK_ERROR') {
 *     // showToast('Please check your internet connection', 'error');
 *   }
 *
 *   // Return the error to continue throwing
 *   return error;
 * });
 */
