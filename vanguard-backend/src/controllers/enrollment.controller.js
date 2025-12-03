const enrollmentService = require('../services/enrollment.service');
const logger = require('../utils/logger');

/**
 * Get all enrollments for current parent
 * GET /api/enrollments/my-enrollments
 */
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await enrollmentService.getMyEnrollments(req.user.id);

    res.status(200).json({
      enrollments,
      total: enrollments.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollment by ID
 * GET /api/enrollments/:id
 */
const getEnrollmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enrollment = await enrollmentService.getEnrollmentById(id, req.user.id);

    res.status(200).json({
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create enrollment
 * POST /api/enrollments
 */
const createEnrollment = async (req, res, next) => {
  try {
    const { athleteId, sessionId, startDate } = req.body;

    const enrollmentData = {
      athleteId,
      sessionId,
      startDate,
    };

    const enrollment = await enrollmentService.createEnrollment(req.user.id, enrollmentData);

    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel enrollment
 * PATCH /api/enrollments/:id/cancel
 */
const cancelEnrollment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const enrollment = await enrollmentService.cancelEnrollment(id, req.user.id);

    res.status(200).json({
      message: 'Enrollment cancelled successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session attendance (coach access)
 * GET /api/sessions/:sessionId/attendance
 */
const getSessionAttendance = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { date } = req.query;

    const attendance = await enrollmentService.getSessionAttendance(sessionId, date);

    res.status(200).json({
      attendance,
      total: attendance.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark attendance (coach access)
 * POST /api/attendance
 */
const markAttendance = async (req, res, next) => {
  try {
    const { enrollmentId, date, status, notes } = req.body;

    const attendanceData = {
      date,
      status,
      notes,
    };

    const attendance = await enrollmentService.markAttendance(enrollmentId, attendanceData);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get enrollments for a session (coach/admin access)
 * GET /api/sessions/:sessionId/enrollments
 */
const getSessionEnrollments = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const enrollments = await enrollmentService.getSessionEnrollments(sessionId);

    res.status(200).json({
      enrollments,
      total: enrollments.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyEnrollments,
  getEnrollmentById,
  createEnrollment,
  cancelEnrollment,
  getSessionAttendance,
  markAttendance,
  getSessionEnrollments,
};
