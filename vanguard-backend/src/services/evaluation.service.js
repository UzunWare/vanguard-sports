const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get evaluations
 * - Parents: Get evaluations for their athletes
 * - Coaches: Get evaluations they created
 * - Admins: Get all evaluations
 */
const getEvaluations = async (userId, userRole, filters = {}) => {
  try {
    let query = `
      SELECT
        ev.*,
        a.first_name as athlete_first_name,
        a.last_name as athlete_last_name,
        s.sport,
        s.level,
        u.first_name || ' ' || u.last_name as coach_name,
        json_agg(
          json_build_object(
            'skill', er.skill_name,
            'rating', er.rating,
            'notes', er.notes
          ) ORDER BY er.skill_name
        ) FILTER (WHERE er.id IS NOT NULL) as ratings
      FROM evaluations ev
      INNER JOIN athletes a ON ev.athlete_id = a.id
      INNER JOIN sessions s ON ev.session_id = s.id
      LEFT JOIN users u ON ev.coach_id = u.id
      LEFT JOIN evaluation_ratings er ON ev.id = er.evaluation_id
      LEFT JOIN enrollments e ON ev.athlete_id = e.athlete_id AND ev.session_id = e.session_id
    `;

    const params = [];
    let whereClause = 'WHERE 1=1';

    // Role-based filtering
    if (userRole === 'parent') {
      params.push(userId);
      whereClause += ` AND e.parent_id = $${params.length}`;
    } else if (userRole === 'coach') {
      params.push(userId);
      whereClause += ` AND ev.coach_id = $${params.length}`;
    }
    // Admin gets all evaluations (no filter)

    // Additional filters
    if (filters.athleteId) {
      params.push(filters.athleteId);
      whereClause += ` AND ev.athlete_id = $${params.length}`;
    }

    if (filters.sessionId) {
      params.push(filters.sessionId);
      whereClause += ` AND ev.session_id = $${params.length}`;
    }

    query += ` ${whereClause}`;
    query += ` GROUP BY ev.id, a.first_name, a.last_name, s.sport, s.level, u.first_name, u.last_name`;
    query += ` ORDER BY ev.evaluation_date DESC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Get evaluations error:', error.message);
    throw error;
  }
};

/**
 * Get evaluation by ID
 */
const getEvaluationById = async (evaluationId, userId = null, userRole = null) => {
  try {
    let query = `
      SELECT
        ev.*,
        a.first_name as athlete_first_name,
        a.last_name as athlete_last_name,
        s.sport,
        s.level,
        u.first_name || ' ' || u.last_name as coach_name,
        json_agg(
          json_build_object(
            'id', er.id,
            'skill', er.skill_name,
            'rating', er.rating,
            'notes', er.notes
          ) ORDER BY er.skill_name
        ) FILTER (WHERE er.id IS NOT NULL) as ratings
      FROM evaluations ev
      INNER JOIN athletes a ON ev.athlete_id = a.id
      INNER JOIN sessions s ON ev.session_id = s.id
      LEFT JOIN users u ON ev.coach_id = u.id
      LEFT JOIN evaluation_ratings er ON ev.id = er.evaluation_id
      LEFT JOIN enrollments e ON ev.athlete_id = e.athlete_id AND ev.session_id = e.session_id
      WHERE ev.id = $1
    `;

    const params = [evaluationId];

    // Role-based access control
    if (userId && userRole === 'parent') {
      params.push(userId);
      query += ` AND e.parent_id = $${params.length}`;
    } else if (userId && userRole === 'coach') {
      params.push(userId);
      query += ` AND ev.coach_id = $${params.length}`;
    }

    query += ` GROUP BY ev.id, a.first_name, a.last_name, s.sport, s.level, u.first_name, u.last_name`;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      const error = new Error('Evaluation not found');
      error.statusCode = 404;
      error.code = 'EVALUATION_NOT_FOUND';
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get evaluation by ID error:', error.message);
    throw error;
  }
};

/**
 * Create evaluation (coach only)
 */
const createEvaluation = async (coachId, evaluationData) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Create evaluation
    const evaluationQuery = `
      INSERT INTO evaluations (athlete_id, session_id, coach_id, evaluation_date, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const evaluationValues = [
      evaluationData.athleteId,
      evaluationData.sessionId,
      coachId,
      evaluationData.evaluationDate || new Date(),
      evaluationData.notes,
    ];

    const evaluationResult = await client.query(evaluationQuery, evaluationValues);
    const evaluation = evaluationResult.rows[0];

    // Create evaluation ratings if provided
    if (evaluationData.ratings && Array.isArray(evaluationData.ratings)) {
      for (const rating of evaluationData.ratings) {
        const ratingQuery = `
          INSERT INTO evaluation_ratings (evaluation_id, skill_name, rating, notes)
          VALUES ($1, $2, $3, $4)
        `;

        await client.query(ratingQuery, [
          evaluation.id,
          rating.skill,
          rating.rating,
          rating.notes,
        ]);
      }
    }

    await client.query('COMMIT');

    logger.info(`Evaluation created: ${evaluation.id} by coach: ${coachId}`);
    return await getEvaluationById(evaluation.id);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create evaluation error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update evaluation (coach only)
 */
const updateEvaluation = async (evaluationId, coachId, updateData) => {
  const client = await db.getClient();

  try {
    // Verify ownership
    const ownership = await client.query(
      'SELECT coach_id FROM evaluations WHERE id = $1',
      [evaluationId]
    );

    if (ownership.rows.length === 0) {
      const error = new Error('Evaluation not found');
      error.statusCode = 404;
      error.code = 'EVALUATION_NOT_FOUND';
      throw error;
    }

    if (ownership.rows[0].coach_id !== coachId) {
      const error = new Error('You can only update your own evaluations');
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    await client.query('BEGIN');

    // Update evaluation
    const allowedFields = ['evaluation_date', 'notes'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fieldMap = {
      evaluationDate: 'evaluation_date',
      notes: 'notes',
    };

    Object.keys(updateData).forEach(key => {
      const dbField = fieldMap[key] || key;
      if (allowedFields.includes(dbField) && updateData[key] !== undefined) {
        updates.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length > 0) {
      values.push(evaluationId);

      const query = `
        UPDATE evaluations
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;

      await client.query(query, values);
    }

    // Update ratings if provided
    if (updateData.ratings && Array.isArray(updateData.ratings)) {
      // Delete existing ratings
      await client.query('DELETE FROM evaluation_ratings WHERE evaluation_id = $1', [evaluationId]);

      // Insert new ratings
      for (const rating of updateData.ratings) {
        const ratingQuery = `
          INSERT INTO evaluation_ratings (evaluation_id, skill_name, rating, notes)
          VALUES ($1, $2, $3, $4)
        `;

        await client.query(ratingQuery, [
          evaluationId,
          rating.skill,
          rating.rating,
          rating.notes,
        ]);
      }
    }

    await client.query('COMMIT');

    logger.info(`Evaluation updated: ${evaluationId}`);
    return await getEvaluationById(evaluationId);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update evaluation error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete evaluation (coach only)
 */
const deleteEvaluation = async (evaluationId, coachId) => {
  try {
    // Verify ownership
    const ownership = await db.query(
      'SELECT coach_id FROM evaluations WHERE id = $1',
      [evaluationId]
    );

    if (ownership.rows.length === 0) {
      const error = new Error('Evaluation not found');
      error.statusCode = 404;
      error.code = 'EVALUATION_NOT_FOUND';
      throw error;
    }

    if (ownership.rows[0].coach_id !== coachId) {
      const error = new Error('You can only delete your own evaluations');
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    // Delete evaluation (cascade will delete ratings)
    await db.query('DELETE FROM evaluations WHERE id = $1', [evaluationId]);

    logger.info(`Evaluation deleted: ${evaluationId}`);
    return { id: evaluationId };
  } catch (error) {
    logger.error('Delete evaluation error:', error.message);
    throw error;
  }
};

module.exports = {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
};
