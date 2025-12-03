const authService = require('../services/auth.service');
const logger = require('../utils/logger');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    const user = await authService.register({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Auto-login after registration
    const loginResult = await authService.login(email, password);

    res.status(201).json({
      message: 'Registration successful',
      user: loginResult.user,
      accessToken: loginResult.accessToken,
      refreshToken: loginResult.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Refresh token is required',
        },
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      message: 'Token refreshed',
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword,
  getCurrentUser,
};
