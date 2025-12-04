const authService = require('../services/auth.service');
const athleteService = require('../services/athlete.service');
const enrollmentService = require('../services/enrollment.service');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Public Enrollment Controller
 * Handles anonymous enrollment submissions from non-authenticated parents
 * Creates parent account, athletes, and enrollments in a single transaction
 * POST /api/public/enroll
 */
const createPublicEnrollment = async (req, res, next) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const { parentInfo, athletes, paymentInfo } = req.body;

    // Validate required fields
    if (!parentInfo || !parentInfo.email || !parentInfo.firstName || !parentInfo.lastName) {
      const error = new Error('Parent information is required');
      error.statusCode = 400;
      error.code = 'MISSING_PARENT_INFO';
      throw error;
    }

    if (!athletes || !Array.isArray(athletes) || athletes.length === 0) {
      const error = new Error('At least one athlete is required');
      error.statusCode = 400;
      error.code = 'MISSING_ATHLETES';
      throw error;
    }

    // Step 1: Create or get parent account
    logger.info(`Creating/finding parent account for: ${parentInfo.email}`);
    const accountResult = await authService.createParentAccountWithTempPassword({
      email: parentInfo.email,
      firstName: parentInfo.firstName,
      lastName: parentInfo.lastName,
      phone: parentInfo.phone || null,
    });

    const parentId = accountResult.user.id;

    // Step 2: Create athletes and enrollments
    const createdEnrollments = [];

    for (const athleteData of athletes) {
      // Validate athlete data
      if (!athleteData.firstName || !athleteData.lastName || !athleteData.dateOfBirth || !athleteData.sessionId) {
        const error = new Error('Athlete information incomplete');
        error.statusCode = 400;
        error.code = 'INVALID_ATHLETE_DATA';
        throw error;
      }

      // Create athlete
      const athlete = await client.query(
        `INSERT INTO athletes (first_name, last_name, date_of_birth, gender, jersey_size, status)
         VALUES ($1, $2, $3, $4, $5, 'active')
         RETURNING id, first_name, last_name, date_of_birth, gender, jersey_size`,
        [
          athleteData.firstName,
          athleteData.lastName,
          athleteData.dateOfBirth,
          athleteData.gender || 'Male',
          athleteData.jerseySize || 'M',
        ]
      );

      const athleteId = athlete.rows[0].id;

      // Link athlete to parent
      await client.query(
        `INSERT INTO parent_athletes (parent_id, athlete_id, relationship, is_primary)
         VALUES ($1, $2, 'Parent', true)`,
        [parentId, athleteId]
      );

      // Check session capacity
      const sessionCheck = await client.query(
        `SELECT s.id, s.capacity, s.sport, s.level, s.location, s.start_time, s.end_time,
                COUNT(e.id) FILTER (WHERE e.status = 'active') as enrolled_count
         FROM sessions s
         LEFT JOIN enrollments e ON s.id = e.session_id
         WHERE s.id = $1
         GROUP BY s.id`,
        [athleteData.sessionId]
      );

      if (sessionCheck.rows.length === 0) {
        const error = new Error(`Session not found: ${athleteData.sessionId}`);
        error.statusCode = 404;
        error.code = 'SESSION_NOT_FOUND';
        throw error;
      }

      const session = sessionCheck.rows[0];
      if (parseInt(session.enrolled_count) >= parseInt(session.capacity)) {
        const error = new Error(`Session "${session.level}" is at full capacity`);
        error.statusCode = 400;
        error.code = 'SESSION_FULL';
        throw error;
      }

      // Create enrollment
      const enrollment = await client.query(
        `INSERT INTO enrollments (athlete_id, session_id, parent_id, status, start_date)
         VALUES ($1, $2, $3, 'active', COALESCE($4, CURRENT_DATE))
         RETURNING id`,
        [athleteId, athleteData.sessionId, parentId, athleteData.startDate || null]
      );

      createdEnrollments.push({
        enrollmentId: enrollment.rows[0].id,
        athleteName: `${athlete.rows[0].first_name} ${athlete.rows[0].last_name}`,
        sessionTitle: `${session.sport} - ${session.level}`,
        sessionTime: `${session.start_time} - ${session.end_time}`,
        sessionLocation: session.location || 'TBD',
      });
    }

    await client.query('COMMIT');

    // Step 3: Send emails (in background, don't block response)
    (async () => {
      try {
        // If new account, send welcome email with credentials
        if (accountResult.isNewAccount) {
          await emailService.sendAccountCreatedEmail({
            email: parentInfo.email,
            firstName: parentInfo.firstName,
            lastName: parentInfo.lastName,
            temporaryPassword: accountResult.temporaryPassword,
          });
          logger.info(`Welcome email with credentials sent to: ${parentInfo.email}`);
        }

        // Send enrollment confirmations
        for (const enrollment of createdEnrollments) {
          await emailService.sendEnrollmentConfirmationEmail({
            parentEmail: parentInfo.email,
            parentName: `${parentInfo.firstName} ${parentInfo.lastName}`,
            athleteName: enrollment.athleteName,
            sessionTitle: enrollment.sessionTitle,
            sessionDate: new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            sessionTime: enrollment.sessionTime,
            sessionLocation: enrollment.sessionLocation,
          });
        }

        logger.info(`Enrollment confirmation emails sent for ${createdEnrollments.length} athletes`);
      } catch (emailError) {
        logger.error('Failed to send enrollment emails:', emailError);
        // Don't throw - email failures shouldn't break the enrollment
      }
    })();

    // Step 4: Return success response
    res.status(201).json({
      message: 'Enrollment successful',
      isNewAccount: accountResult.isNewAccount,
      parentId: parentId,
      enrollments: createdEnrollments,
      accountCreatedMessage: accountResult.isNewAccount
        ? 'A new parent account has been created. Check your email for login credentials.'
        : 'Enrollment added to your existing account.',
    });

    logger.info(`Public enrollment completed: ${createdEnrollments.length} athletes enrolled for parent ${parentInfo.email}`);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Public enrollment error:', error.message);
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  createPublicEnrollment,
};
