const express = require('express');
const { body, param } = require('express-validator');
const sessionController = require('../controllers/session.controller');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Session Routes
 */

// Validation rules
const createSessionValidation = [
  body('sport').isIn(['Basketball', 'Volleyball']).withMessage('Sport must be Basketball or Volleyball'),
  body('level').trim().notEmpty().withMessage('Level is required'),
  body('grades').trim().notEmpty().withMessage('Grades are required'),
  body('gender').isIn(['Male', 'Female', 'Coed']).withMessage('Gender must be Male, Female, or Coed'),
  body('minAge').isInt({ min: 6, max: 18 }).withMessage('Min age must be between 6-18'),
  body('maxAge').isInt({ min: 6, max: 18 }).withMessage('Max age must be between 6-18'),
  body('dayOfWeek').notEmpty().withMessage('Day of week is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('Start time must be in HH:MM:SS format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/).withMessage('End time must be in HH:MM:SS format'),
  body('durationMinutes').isInt({ min: 30, max: 180 }).withMessage('Duration must be between 30-180 minutes'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('capacity').isInt({ min: 8, max: 50 }).withMessage('Capacity must be between 8-50'),
  body('price').isFloat({ min: 50, max: 500 }).withMessage('Price must be between $50-$500'),
  body('registrationFee').optional().isFloat({ min: 0, max: 100 }).withMessage('Registration fee must be between $0-$100'),
  body('headCoachId').isUUID().withMessage('Head coach ID must be a valid UUID'),
  body('assistantCoachId').optional().isUUID().withMessage('Assistant coach ID must be a valid UUID'),
  body('description').optional().trim(),
  body('status').optional().isIn(['Open', 'Limited', 'Full', 'Waitlist Soon', 'Archived']),
  body('features').optional().isArray().withMessage('Features must be an array'),
];

const updateSessionValidation = [
  param('id').isUUID().withMessage('Session ID must be a valid UUID'),
  body('sport').optional().isIn(['Basketball', 'Volleyball']),
  body('level').optional().trim().notEmpty(),
  body('grades').optional().trim().notEmpty(),
  body('gender').optional().isIn(['Male', 'Female', 'Coed']),
  body('minAge').optional().isInt({ min: 6, max: 18 }),
  body('maxAge').optional().isInt({ min: 6, max: 18 }),
  body('dayOfWeek').optional().notEmpty(),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/),
  body('durationMinutes').optional().isInt({ min: 30, max: 180 }),
  body('location').optional().trim().notEmpty(),
  body('capacity').optional().isInt({ min: 8, max: 50 }),
  body('price').optional().isFloat({ min: 50, max: 500 }),
  body('registrationFee').optional().isFloat({ min: 0, max: 100 }),
  body('headCoachId').optional().isUUID(),
  body('assistantCoachId').optional().isUUID(),
  body('description').optional().trim(),
  body('status').optional().isIn(['Open', 'Limited', 'Full', 'Waitlist Soon', 'Archived']),
  body('features').optional().isArray(),
];

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions
 * @access  Public
 */
router.get('/', sessionController.getAllSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get session by ID
 * @access  Public
 */
router.get('/:id', param('id').isUUID(), validate, sessionController.getSessionById);

/**
 * @route   POST /api/sessions
 * @desc    Create new session
 * @access  Private (Admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  createSessionValidation,
  validate,
  sessionController.createSession
);

/**
 * @route   PATCH /api/sessions/:id
 * @desc    Update session
 * @access  Private (Admin only)
 */
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  updateSessionValidation,
  validate,
  sessionController.updateSession
);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete session
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  param('id').isUUID(),
  validate,
  sessionController.deleteSession
);

module.exports = router;
