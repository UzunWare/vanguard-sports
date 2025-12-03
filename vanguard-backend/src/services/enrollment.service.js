const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all enrollments for a parent
 */
const getMyEnrollments = async (parentId) => {
  try {
    const query = `
      SELECT
        e.*,
        a.first_name as athlete_first_name,
        a.last_name as athlete_last_name,
        a.date_of_birth as athlete_dob,
        s.sport,
        s.level,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.location,
        u.first_name || ' ' || u.last_name as coach_name
      FROM enrollments e
      INNER JOIN athletes a ON e.athlete_id = a.id
      INNER JOIN sessions s ON e.session_id = s.id
      LEFT JOIN users u ON s.head_coach_id = u.id
      WHERE e.parent_id = $1
      ORDER BY e.created_at DESC
    `;

    const result = await db.query(query, [parentId]);
    return result.rows;
  } catch (error) {
    logger.error('Get my enrollments error:', error.message);
    throw error;
  }
};

/**
 * Get enrollment by ID
 */
const getEnrollmentById = async (enrollmentId, parentId = null) => {
  try {
    let query = `
      SELECT
        e.*,
        a.first_name as athlete_first_name,
        a.last_name as athlete_last_name,
        s.sport,
        s.level,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.location,
        s.price,
        s.registration_fee
      FROM enrollments e
      INNER JOIN athletes a ON e.athlete_id = a.id
      INNER JOIN sessions s ON e.session_id = s.id
      WHERE e.id = $1
    `;

    const params = [enrollmentId];

    if (parentId) {
      query += ` AND e.parent_id = $2`;
      params.push(parentId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      const error = new Error('Enrollment not found');
      error.statusCode = 404;
      error.code = 'ENROLLMENT_NOT_FOUND';
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get enrollment by ID error:', error.message);
    throw error;
  }
};

/**
 * Create enrollment
 */
const createEnrollment = async (parentId, enrollmentData) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Verify athlete belongs to parent
    const athleteCheck = await client.query(
      `SELECT id FROM parent_athletes WHERE parent_id = $1 AND athlete_id = $2`,
      [parentId, enrollmentData.athleteId]
    );

    if (athleteCheck.rows.length === 0) {
      const error = new Error('Athlete does not belong to this parent');
      error.statusCode = 403;
      error.code = 'ATHLETE_NOT_OWNED';
      throw error;
    }

    // Check session capacity
    const capacityCheck = await client.query(
      `SELECT
         s.capacity,
         COUNT(e.id) FILTER (WHERE e.status = 'active') as enrolled_count
       FROM sessions s
       LEFT JOIN enrollments e ON s.id = e.session_id
       WHERE s.id = $1
       GROUP BY s.id, s.capacity`,
      [enrollmentData.sessionId]
    );

    if (capacityCheck.rows.length === 0) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      error.code = 'SESSION_NOT_FOUND';
      throw error;
    }

    const { capacity, enrolled_count } = capacityCheck.rows[0];

    if (parseInt(enrolled_count) >= parseInt(capacity)) {
      const error = new Error('Session is at full capacity');
      error.statusCode = 400;
      error.code = 'SESSION_FULL';
      throw error;
    }

    // Check for duplicate enrollment
    const duplicateCheck = await client.query(
      `SELECT id FROM enrollments
       WHERE athlete_id = $1 AND session_id = $2 AND status IN ('active', 'pending')`,
      [enrollmentData.athleteId, enrollmentData.sessionId]
    );

    if (duplicateCheck.rows.length > 0) {
      const error = new Error('Athlete is already enrolled in this session');
      error.statusCode = 400;
      error.code = 'DUPLICATE_ENROLLMENT';
      throw error;
    }

    // Create enrollment
    const enrollmentQuery = `
      INSERT INTO enrollments (athlete_id, session_id, parent_id, status, start_date)
      VALUES ($1, $2, $3, 'active', COALESCE($4, CURRENT_DATE))
      RETURNING *
    `;

    const enrollmentValues = [
      enrollmentData.athleteId,
      enrollmentData.sessionId,
      parentId,
      enrollmentData.startDate,
    ];

    const result = await client.query(enrollmentQuery, enrollmentValues);

    await client.query('COMMIT');

    logger.info(`Enrollment created: ${result.rows[0].id}`);
    return await getEnrollmentById(result.rows[0].id, parentId);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create enrollment error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Cancel enrollment
 */
const cancelEnrollment = async (enrollmentId, parentId) => {
  try {
    // Verify ownership
    await getEnrollmentById(enrollmentId, parentId);

    const query = `
      UPDATE enrollments
      SET status = 'cancelled', end_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [enrollmentId]);

    logger.info(`Enrollment cancelled: ${enrollmentId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Cancel enrollment error:', error.message);
    throw error;
  }
};

/**
 * Get session attendance (coach access)
 */
const getSessionAttendance = async (sessionId, date = null) => {
  try {
    let query = `
      SELECT
        al.*,
        a.first_name,
        a.last_name,
        e.id as enrollment_id
      FROM attendance_logs al
      INNER JOIN enrollments e ON al.enrollment_id = e.id
      INNER JOIN athletes a ON e.athlete_id = a.id
      WHERE e.session_id = $1
    `;

    const params = [sessionId];

    if (date) {
      query += ` AND DATE(al.date) = $2`;
      params.push(date);
    }

    query += ` ORDER BY al.date DESC, a.last_name, a.first_name`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Get session attendance error:', error.message);
    throw error;
  }
};

/**
 * Mark attendance
 */
const markAttendance = async (enrollmentId, attendanceData) => {
  try {
    // Check if attendance already exists for this date
    const existingCheck = await db.query(
      `SELECT id FROM attendance_logs
       WHERE enrollment_id = $1 AND DATE(date) = $2`,
      [enrollmentId, attendanceData.date]
    );

    if (existingCheck.rows.length > 0) {
      // Update existing attendance
      const updateQuery = `
        UPDATE attendance_logs
        SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      const result = await db.query(updateQuery, [
        attendanceData.status,
        attendanceData.notes,
        existingCheck.rows[0].id,
      ]);

      logger.info(`Attendance updated: ${result.rows[0].id}`);
      return result.rows[0];
    } else {
      // Create new attendance record
      const insertQuery = `
        INSERT INTO attendance_logs (enrollment_id, date, status, notes)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await db.query(insertQuery, [
        enrollmentId,
        attendanceData.date,
        attendanceData.status,
        attendanceData.notes,
      ]);

      logger.info(`Attendance marked: ${result.rows[0].id}`);
      return result.rows[0];
    }
  } catch (error) {
    logger.error('Mark attendance error:', error.message);
    throw error;
  }
};

/**
 * Get enrollments for a session (coach/admin access)
 */
const getSessionEnrollments = async (sessionId) => {
  try {
    const query = `
      SELECT
        e.*,
        a.first_name as athlete_first_name,
        a.last_name as athlete_last_name,
        a.date_of_birth as athlete_dob,
        a.gender as athlete_gender,
        u.first_name || ' ' || u.last_name as parent_name,
        u.phone as parent_phone,
        u.email as parent_email
      FROM enrollments e
      INNER JOIN athletes a ON e.athlete_id = a.id
      INNER JOIN users u ON e.parent_id = u.id
      WHERE e.session_id = $1 AND e.status = 'active'
      ORDER BY a.last_name, a.first_name
    `;

    const result = await db.query(query, [sessionId]);
    return result.rows;
  } catch (error) {
    logger.error('Get session enrollments error:', error.message);
    throw error;
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
