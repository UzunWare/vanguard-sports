const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/user.controller');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * User Routes
 */

// Validation rules
const updateProfileValidation = [
  body('firstName').optional().trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').optional().trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('phone').optional().matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone must be in format: (210) 555-0100'),
];

const updateUserByAdminValidation = [
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('phone').optional().matches(/^\(\d{3}\) \d{3}-\d{4}$/),
  body('role').optional().isIn(['admin', 'coach', 'parent']).withMessage('Role must be admin, coach, or parent'),
  body('status').optional().isIn(['active', 'suspended', 'deleted']).withMessage('Status must be active, suspended, or deleted'),
  body('emailVerified').optional().isBoolean(),
];

const userIdValidation = [
  param('id').isUUID().withMessage('User ID must be a valid UUID'),
];

const getAllUsersValidation = [
  query('role').optional().isIn(['admin', 'coach', 'parent']),
  query('status').optional().isIn(['active', 'suspended', 'deleted']),
  query('search').optional().trim(),
];

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @route   PATCH /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.patch('/me', authenticate, updateProfileValidation, validate, userController.updateProfile);

/**
 * Admin Routes
 */

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/', authenticate, authorize('admin'), getAllUsersValidation, validate, userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/:id', authenticate, authorize('admin'), userIdValidation, validate, userController.getUserById);

/**
 * @route   PATCH /api/users/:id
 * @desc    Update user by admin
 * @access  Private (Admin only)
 */
router.patch('/:id', authenticate, authorize('admin'), updateUserByAdminValidation, validate, userController.updateUser);

/**
 * @route   PATCH /api/users/:id/suspend
 * @desc    Suspend user account
 * @access  Private (Admin only)
 */
router.patch('/:id/suspend', authenticate, authorize('admin'), userIdValidation, validate, userController.suspendUser);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user account
 * @access  Private (Admin only)
 */
router.patch('/:id/activate', authenticate, authorize('admin'), userIdValidation, validate, userController.activateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), userIdValidation, validate, userController.deleteUser);

module.exports = router;
