const express = require('express');
const { body, param, query } = require('express-validator');
const enrollmentController = require('../controllers/enrollment.controller');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Enrollment Routes
 */

// Validation rules
const createEnrollmentValidation = [
  body('athleteId').isUUID().withMessage('Athlete ID must be a valid UUID'),
  body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
  body('startDate').optional().isDate().withMessage('Start date must be a valid date'),
];

const enrollmentIdValidation = [
  param('id').isUUID().withMessage('Enrollment ID must be a valid UUID'),
];

const sessionIdValidation = [
  param('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
];

const markAttendanceValidation = [
  body('enrollmentId').isUUID().withMessage('Enrollment ID must be a valid UUID'),
  body('date').isDate().withMessage('Date must be a valid date'),
  body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Status must be present, absent, late, or excused'),
  body('notes').optional().trim(),
];

const attendanceQueryValidation = [
  param('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
  query('date').optional().isDate().withMessage('Date must be a valid date'),
];

/**
 * Parent Routes
 */

/**
 * @route   GET /api/enrollments/my-enrollments
 * @desc    Get all enrollments for current parent
 * @access  Private (Parent only)
 */
router.get('/my-enrollments', authenticate, authorize('parent'), enrollmentController.getMyEnrollments);

/**
 * @route   GET /api/enrollments/:id
 * @desc    Get enrollment by ID
 * @access  Private (Parent only)
 */
router.get('/:id', authenticate, authorize('parent'), enrollmentIdValidation, validate, enrollmentController.getEnrollmentById);

/**
 * @route   POST /api/enrollments
 * @desc    Create new enrollment
 * @access  Private (Parent only)
 */
router.post('/', authenticate, authorize('parent'), createEnrollmentValidation, validate, enrollmentController.createEnrollment);

/**
 * @route   PATCH /api/enrollments/:id/cancel
 * @desc    Cancel enrollment
 * @access  Private (Parent only)
 */
router.patch('/:id/cancel', authenticate, authorize('parent'), enrollmentIdValidation, validate, enrollmentController.cancelEnrollment);

/**
 * Coach Routes
 */

/**
 * @route   GET /api/enrollments/sessions/:sessionId/attendance
 * @desc    Get session attendance
 * @access  Private (Coach, Admin)
 */
router.get('/sessions/:sessionId/attendance', authenticate, authorize('coach', 'admin'), attendanceQueryValidation, validate, enrollmentController.getSessionAttendance);

/**
 * @route   POST /api/enrollments/attendance
 * @desc    Mark attendance
 * @access  Private (Coach, Admin)
 */
router.post('/attendance', authenticate, authorize('coach', 'admin'), markAttendanceValidation, validate, enrollmentController.markAttendance);

/**
 * @route   GET /api/enrollments/sessions/:sessionId
 * @desc    Get session enrollments
 * @access  Private (Coach, Admin)
 */
router.get('/sessions/:sessionId', authenticate, authorize('coach', 'admin'), sessionIdValidation, validate, enrollmentController.getSessionEnrollments);

module.exports = router;
