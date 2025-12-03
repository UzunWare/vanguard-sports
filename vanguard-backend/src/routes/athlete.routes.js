const express = require('express');
const { body, param } = require('express-validator');
const athleteController = require('../controllers/athlete.controller');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Athlete Routes (Parent access)
 */

// Validation rules
const createAthleteValidation = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('dateOfBirth').isDate().withMessage('Date of birth must be a valid date'),
  body('gender').isIn(['Male', 'Female']).withMessage('Gender must be Male or Female'),
  body('jerseySize').optional().isIn(['YXS', 'YS', 'YM', 'YL', 'YXL', 'AS', 'AM', 'AL', 'AXL']).withMessage('Invalid jersey size'),
  body('relationship').optional().trim().notEmpty(),
  body('isPrimary').optional().isBoolean(),
  body('allergies').optional().trim(),
  body('conditions').optional().trim(),
  body('medications').optional().trim(),
];

const updateAthleteValidation = [
  param('id').isUUID().withMessage('Athlete ID must be a valid UUID'),
  body('firstName').optional().trim().isLength({ min: 2 }),
  body('lastName').optional().trim().isLength({ min: 2 }),
  body('dateOfBirth').optional().isDate(),
  body('gender').optional().isIn(['Male', 'Female']),
  body('jerseySize').optional().isIn(['YXS', 'YS', 'YM', 'YL', 'YXL', 'AS', 'AM', 'AL', 'AXL']),
];

const updateMedicalValidation = [
  param('id').isUUID().withMessage('Athlete ID must be a valid UUID'),
  body('allergies').optional().trim(),
  body('conditions').optional().trim(),
  body('medications').optional().trim(),
];

const addEmergencyContactValidation = [
  param('id').isUUID().withMessage('Athlete ID must be a valid UUID'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').matches(/^\(\d{3}\) \d{3}-\d{4}$/).withMessage('Phone must be in format: (210) 555-0100'),
  body('relationship').trim().notEmpty().withMessage('Relationship is required'),
  body('isPrimary').optional().isBoolean(),
];

const athleteIdValidation = [
  param('id').isUUID().withMessage('Athlete ID must be a valid UUID'),
];

const emergencyContactValidation = [
  param('id').isUUID().withMessage('Athlete ID must be a valid UUID'),
  param('contactId').isUUID().withMessage('Contact ID must be a valid UUID'),
];

/**
 * @route   GET /api/athletes/my-athletes
 * @desc    Get all athletes for current parent
 * @access  Private (Parent only)
 */
router.get('/my-athletes', authenticate, authorize('parent'), athleteController.getMyAthletes);

/**
 * @route   GET /api/athletes/:id
 * @desc    Get athlete by ID
 * @access  Private (Parent only)
 */
router.get('/:id', authenticate, authorize('parent'), athleteIdValidation, validate, athleteController.getAthleteById);

/**
 * @route   POST /api/athletes
 * @desc    Create new athlete
 * @access  Private (Parent only)
 */
router.post('/', authenticate, authorize('parent'), createAthleteValidation, validate, athleteController.createAthlete);

/**
 * @route   PATCH /api/athletes/:id
 * @desc    Update athlete
 * @access  Private (Parent only)
 */
router.patch('/:id', authenticate, authorize('parent'), updateAthleteValidation, validate, athleteController.updateAthlete);

/**
 * @route   PATCH /api/athletes/:id/medical
 * @desc    Update medical information
 * @access  Private (Parent only)
 */
router.patch('/:id/medical', authenticate, authorize('parent'), updateMedicalValidation, validate, athleteController.updateMedicalInfo);

/**
 * @route   POST /api/athletes/:id/emergency-contacts
 * @desc    Add emergency contact
 * @access  Private (Parent only)
 */
router.post('/:id/emergency-contacts', authenticate, authorize('parent'), addEmergencyContactValidation, validate, athleteController.addEmergencyContact);

/**
 * @route   DELETE /api/athletes/:id/emergency-contacts/:contactId
 * @desc    Remove emergency contact
 * @access  Private (Parent only)
 */
router.delete('/:id/emergency-contacts/:contactId', authenticate, authorize('parent'), emergencyContactValidation, validate, athleteController.removeEmergencyContact);

/**
 * @route   DELETE /api/athletes/:id
 * @desc    Delete athlete
 * @access  Private (Parent only)
 */
router.delete('/:id', authenticate, authorize('parent'), athleteIdValidation, validate, athleteController.deleteAthlete);

module.exports = router;
