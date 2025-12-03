const express = require('express');
const { body, param, query } = require('express-validator');
const evaluationController = require('../controllers/evaluation.controller');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Evaluation Routes
 */

// Validation rules
const createEvaluationValidation = [
  body('athleteId').isUUID().withMessage('Athlete ID must be a valid UUID'),
  body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
  body('evaluationDate').optional().isDate().withMessage('Evaluation date must be a valid date'),
  body('notes').optional().trim(),
  body('ratings').optional().isArray().withMessage('Ratings must be an array'),
  body('ratings.*.skill').optional().trim().notEmpty(),
  body('ratings.*.rating').optional().isInt({ min: 1, max: 5 }),
  body('ratings.*.notes').optional().trim(),
];

const updateEvaluationValidation = [
  param('id').isUUID().withMessage('Evaluation ID must be a valid UUID'),
  body('evaluationDate').optional().isDate(),
  body('notes').optional().trim(),
  body('ratings').optional().isArray(),
  body('ratings.*.skill').optional().trim().notEmpty(),
  body('ratings.*.rating').optional().isInt({ min: 1, max: 5 }),
  body('ratings.*.notes').optional().trim(),
];

const evaluationIdValidation = [
  param('id').isUUID().withMessage('Evaluation ID must be a valid UUID'),
];

const getEvaluationsValidation = [
  query('athleteId').optional().isUUID(),
  query('sessionId').optional().isUUID(),
];

/**
 * @route   GET /api/evaluations
 * @desc    Get evaluations (role-filtered)
 * @access  Private (All roles)
 */
router.get('/', authenticate, getEvaluationsValidation, validate, evaluationController.getEvaluations);

/**
 * @route   GET /api/evaluations/:id
 * @desc    Get evaluation by ID
 * @access  Private (All roles)
 */
router.get('/:id', authenticate, evaluationIdValidation, validate, evaluationController.getEvaluationById);

/**
 * @route   POST /api/evaluations
 * @desc    Create evaluation
 * @access  Private (Coach, Admin)
 */
router.post('/', authenticate, authorize('coach', 'admin'), createEvaluationValidation, validate, evaluationController.createEvaluation);

/**
 * @route   PATCH /api/evaluations/:id
 * @desc    Update evaluation
 * @access  Private (Coach, Admin)
 */
router.patch('/:id', authenticate, authorize('coach', 'admin'), updateEvaluationValidation, validate, evaluationController.updateEvaluation);

/**
 * @route   DELETE /api/evaluations/:id
 * @desc    Delete evaluation
 * @access  Private (Coach, Admin)
 */
router.delete('/:id', authenticate, authorize('coach', 'admin'), evaluationIdValidation, validate, evaluationController.deleteEvaluation);

module.exports = router;
