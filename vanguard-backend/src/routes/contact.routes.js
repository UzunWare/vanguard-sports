/**
 * Contact Routes
 */

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');

// Public routes (no authentication required)
router.post('/', contactController.submitContactForm);
router.post('/newsletter', contactController.subscribeNewsletter);

module.exports = router;
