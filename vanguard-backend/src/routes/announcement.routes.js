/**
 * Announcement Routes
 * Routes for creating and managing announcements
 */

const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { authenticate, authorize } = require('../middleware/auth');

// All announcement routes require authentication
router.use(authenticate);

// Create and send announcement (admin and coach only)
router.post(
  '/',
  authorize('admin', 'coach'),
  announcementController.createAnnouncement
);

// Get announcements history (admin and coach only)
router.get(
  '/',
  authorize('admin', 'coach'),
  announcementController.getAnnouncements
);

// Get coach's sessions for targeting (coach only)
router.get(
  '/coach-sessions',
  authorize('coach'),
  announcementController.getCoachSessions
);

module.exports = router;
