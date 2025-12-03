const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Session Service
 * Business logic for training session management
 */

/**
 * Get all sessions with enrollment counts
 * @param {Object} filters - Filter criteria (sport, status, day)
 * @returns {Promise<Array>} Sessions list
 */
const getAllSessions = async (filters = {}) => {
  try {
    let query = `
      SELECT
        s.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as head_coach_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as assistant_coach_name,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as enrolled_count,
        array_agg(DISTINCT sf.feature) FILTER (WHERE sf.feature IS NOT NULL) as features
      FROM sessions s
      LEFT JOIN users u1 ON s.head_coach_id = u1.id
      LEFT JOIN users u2 ON s.assistant_coach_id = u2.id
      LEFT JOIN enrollments e ON s.id = e.session_id
      LEFT JOIN session_features sf ON s.id = sf.session_id
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (filters.sport) {
      params.push(filters.sport);
      query += ` AND s.sport = $${params.length}`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` AND s.status = $${params.length}`;
    } else {
      // By default, exclude archived sessions
      query += ` AND s.status != 'Archived'`;
    }

    if (filters.day) {
      params.push(filters.day);
      query += ` AND s.day_of_week = $${params.length}`;
    }

    query += ` GROUP BY s.id, u1.first_name, u1.last_name, u2.first_name, u2.last_name`;
    query += ` ORDER BY s.day_of_week, s.start_time`;

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      ...row,
      features: row.features || []
    }));
  } catch (error) {
    logger.error('Get all sessions error:', error.message);
    throw error;
  }
};

/**
 * Get session by ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} Session details
 */
const getSessionById = async (sessionId) => {
  try {
    const query = `
      SELECT
        s.*,
        CONCAT(u1.first_name, ' ', u1.last_name) as head_coach_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as assistant_coach_name,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') as enrolled_count,
        array_agg(DISTINCT sf.feature) FILTER (WHERE sf.feature IS NOT NULL) as features
      FROM sessions s
      LEFT JOIN users u1 ON s.head_coach_id = u1.id
      LEFT JOIN users u2 ON s.assistant_coach_id = u2.id
      LEFT JOIN enrollments e ON s.id = e.session_id
      LEFT JOIN session_features sf ON s.id = sf.session_id
      WHERE s.id = $1
      GROUP BY s.id, u1.first_name, u1.last_name, u2.first_name, u2.last_name
    `;

    const result = await db.query(query, [sessionId]);

    if (result.rows.length === 0) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return {
      ...result.rows[0],
      features: result.rows[0].features || []
    };
  } catch (error) {
    logger.error('Get session by ID error:', error.message);
    throw error;
  }
};

/**
 * Create new session
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} Created session
 */
const createSession = async (sessionData) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const {
      sport,
      level,
      grades,
      gender,
      minAge,
      maxAge,
      dayOfWeek,
      startTime,
      endTime,
      durationMinutes,
      location,
      capacity,
      price,
      registrationFee,
      headCoachId,
      assistantCoachId,
      description,
      status,
      features
    } = sessionData;

    // Insert session
    const sessionQuery = `
      INSERT INTO sessions (
        sport, level, grades, gender, min_age, max_age, day_of_week,
        start_time, end_time, duration_minutes, location, capacity, price,
        registration_fee, head_coach_id, assistant_coach_id, description, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `;

    const sessionResult = await client.query(sessionQuery, [
      sport, level, grades, gender, minAge, maxAge, dayOfWeek,
      startTime, endTime, durationMinutes, location, capacity, price,
      registrationFee, headCoachId, assistantCoachId, description, status
    ]);

    const session = sessionResult.rows[0];

    // Insert features if provided
    if (features && features.length > 0) {
      const featureQuery = `
        INSERT INTO session_features (session_id, feature)
        VALUES ($1, $2)
      `;

      for (const feature of features) {
        await client.query(featureQuery, [session.id, feature]);
      }
    }

    await client.query('COMMIT');

    logger.info(`Session created: ${session.id}`);

    // Return full session with features
    return await getSessionById(session.id);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create session error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update session
 * @param {string} sessionId - Session ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated session
 */
const updateSession = async (sessionId, updateData) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      sport: 'sport',
      level: 'level',
      grades: 'grades',
      gender: 'gender',
      minAge: 'min_age',
      maxAge: 'max_age',
      dayOfWeek: 'day_of_week',
      startTime: 'start_time',
      endTime: 'end_time',
      durationMinutes: 'duration_minutes',
      location: 'location',
      capacity: 'capacity',
      price: 'price',
      registrationFee: 'registration_fee',
      headCoachId: 'head_coach_id',
      assistantCoachId: 'assistant_coach_id',
      description: 'description',
      status: 'status'
    };

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (updateData[key] !== undefined) {
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    }

    if (fields.length > 0) {
      values.push(sessionId);
      const query = `
        UPDATE sessions
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      await client.query(query, values);
    }

    // Update features if provided
    if (updateData.features) {
      // Delete existing features
      await client.query('DELETE FROM session_features WHERE session_id = $1', [sessionId]);

      // Insert new features
      if (updateData.features.length > 0) {
        const featureQuery = 'INSERT INTO session_features (session_id, feature) VALUES ($1, $2)';
        for (const feature of updateData.features) {
          await client.query(featureQuery, [sessionId, feature]);
        }
      }
    }

    await client.query('COMMIT');

    logger.info(`Session updated: ${sessionId}`);

    // Return updated session
    return await getSessionById(sessionId);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update session error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete session
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
const deleteSession = async (sessionId) => {
  try {
    // Check if session has active enrollments
    const enrollmentCheck = await db.query(
      'SELECT COUNT(*) FROM enrollments WHERE session_id = $1 AND status = $2',
      [sessionId, 'active']
    );

    const activeEnrollments = parseInt(enrollmentCheck.rows[0].count);

    if (activeEnrollments > 0) {
      const error = new Error('Cannot delete session with active enrollments');
      error.statusCode = 400;
      error.code = 'HAS_ACTIVE_ENROLLMENTS';
      throw error;
    }

    // Delete session (cascade will delete features)
    const result = await db.query('DELETE FROM sessions WHERE id = $1 RETURNING id', [sessionId]);

    if (result.rows.length === 0) {
      const error = new Error('Session not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    logger.info(`Session deleted: ${sessionId}`);
  } catch (error) {
    logger.error('Delete session error:', error.message);
    throw error;
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
};
