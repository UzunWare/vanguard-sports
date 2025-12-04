/**
 * Announcement Controller
 * Handles HTTP requests for announcement operations
 */

const announcementService = require('../services/announcement.service');
const logger = require('../utils/logger');

/**
 * Create and send announcement
 * POST /api/announcements
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetAudience, sessionId } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and message are required',
        },
      });
    }

    const result = await announcementService.createAnnouncement({
      title,
      message,
      senderId: req.user.id,
      senderRole: req.user.role,
      targetAudience,
      sessionId,
    });

    res.status(201).json({
      message: 'Announcement created and sent successfully',
      announcement: result.announcement,
      recipientCount: result.recipientCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get announcements history
 * GET /api/announcements
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;

    const filters = {
      limit,
    };

    // Admins can see all announcements
    if (req.user.role === 'admin') {
      // No additional filters needed
    } else if (req.user.role === 'coach') {
      // Coaches can only see their own announcements
      filters.coachId = req.user.id;
    } else {
      // Parents shouldn't access this endpoint
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only admins and coaches can view announcement history',
        },
      });
    }

    const announcements = await announcementService.getAnnouncements(filters);

    res.status(200).json({
      announcements,
      total: announcements.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coach's sessions for announcement targeting
 * GET /api/announcements/coach-sessions
 */
const getCoachSessions = async (req, res, next) => {
  try {
    if (req.user.role !== 'coach') {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Only coaches can access this endpoint',
        },
      });
    }

    const sessions = await announcementService.getCoachSessions(req.user.id);

    res.status(200).json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getCoachSessions,
};
