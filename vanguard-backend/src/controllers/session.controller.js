const sessionService = require('../services/session.service');

/**
 * Session Controller
 * HTTP handlers for session endpoints
 */

/**
 * Get all sessions
 * GET /api/sessions
 */
const getAllSessions = async (req, res, next) => {
  try {
    const { sport, status, day } = req.query;

    const filters = {};
    if (sport) filters.sport = sport;
    if (status) filters.status = status;
    if (day) filters.day = day;

    const sessions = await sessionService.getAllSessions(filters);

    res.status(200).json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await sessionService.getSessionById(id);

    res.status(200).json({ session });
  } catch (error) {
    next(error);
  }
};

/**
 * Create session
 * POST /api/sessions
 */
const createSession = async (req, res, next) => {
  try {
    const sessionData = req.body;

    const session = await sessionService.createSession(sessionData);

    res.status(201).json({
      message: 'Session created successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update session
 * PATCH /api/sessions/:id
 */
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const session = await sessionService.updateSession(id, updateData);

    res.status(200).json({
      message: 'Session updated successfully',
      session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete session
 * DELETE /api/sessions/:id
 */
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    await sessionService.deleteSession(id);

    res.status(200).json({
      message: 'Session deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
};
