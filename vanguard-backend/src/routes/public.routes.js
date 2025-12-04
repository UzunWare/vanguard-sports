const express = require('express');
const router = express.Router();
const publicEnrollmentController = require('../controllers/public-enrollment.controller');

/**
 * Public Routes
 * These routes do not require authentication
 */

/**
 * POST /api/public/enroll
 * Create enrollment for new or existing parent
 * Body: { parentInfo: {...}, athletes: [...], paymentInfo: {...} }
 */
router.post('/enroll', publicEnrollmentController.createPublicEnrollment);

module.exports = router;
