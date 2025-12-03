const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all athletes for a parent
 */
const getMyAthletes = async (parentId) => {
  try {
    const query = `
      SELECT
        a.*,
        pa.relationship,
        pa.is_primary,
        m.allergies,
        m.conditions,
        m.medications,
        json_agg(
          json_build_object(
            'id', ec.id,
            'name', ec.name,
            'phone', ec.phone,
            'relationship', ec.relationship,
            'isPrimary', ec.is_primary
          ) ORDER BY ec.is_primary DESC, ec.created_at
        ) FILTER (WHERE ec.id IS NOT NULL) as emergency_contacts
      FROM athletes a
      INNER JOIN parent_athletes pa ON a.id = pa.athlete_id
      LEFT JOIN medical_info m ON a.id = m.athlete_id
      LEFT JOIN emergency_contacts ec ON a.id = ec.athlete_id
      WHERE pa.parent_id = $1 AND a.status != 'deleted'
      GROUP BY a.id, pa.relationship, pa.is_primary, m.allergies, m.conditions, m.medications
      ORDER BY a.first_name, a.last_name
    `;

    const result = await db.query(query, [parentId]);
    return result.rows;
  } catch (error) {
    logger.error('Get my athletes error:', error.message);
    throw error;
  }
};

/**
 * Get athlete by ID
 */
const getAthleteById = async (athleteId, parentId = null) => {
  try {
    let query = `
      SELECT
        a.*,
        pa.relationship,
        pa.is_primary,
        pa.parent_id,
        m.allergies,
        m.conditions,
        m.medications,
        json_agg(
          json_build_object(
            'id', ec.id,
            'name', ec.name,
            'phone', ec.phone,
            'relationship', ec.relationship,
            'isPrimary', ec.is_primary
          ) ORDER BY ec.is_primary DESC, ec.created_at
        ) FILTER (WHERE ec.id IS NOT NULL) as emergency_contacts
      FROM athletes a
      LEFT JOIN parent_athletes pa ON a.id = pa.athlete_id
      LEFT JOIN medical_info m ON a.id = m.athlete_id
      LEFT JOIN emergency_contacts ec ON a.id = ec.athlete_id
      WHERE a.id = $1 AND a.status != 'deleted'
    `;

    const params = [athleteId];

    if (parentId) {
      query += ` AND pa.parent_id = $2`;
      params.push(parentId);
    }

    query += ` GROUP BY a.id, pa.relationship, pa.is_primary, pa.parent_id, m.allergies, m.conditions, m.medications`;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      const error = new Error('Athlete not found');
      error.statusCode = 404;
      error.code = 'ATHLETE_NOT_FOUND';
      throw error;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get athlete by ID error:', error.message);
    throw error;
  }
};

/**
 * Create new athlete
 */
const createAthlete = async (parentId, athleteData, medicalData = {}) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Insert athlete
    const athleteQuery = `
      INSERT INTO athletes (first_name, last_name, date_of_birth, gender, jersey_size, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `;

    const athleteValues = [
      athleteData.firstName,
      athleteData.lastName,
      athleteData.dateOfBirth,
      athleteData.gender,
      athleteData.jerseySize || 'YM',
    ];

    const athleteResult = await client.query(athleteQuery, athleteValues);
    const athlete = athleteResult.rows[0];

    // Create parent-athlete relationship
    const relationshipQuery = `
      INSERT INTO parent_athletes (parent_id, athlete_id, relationship, is_primary)
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(relationshipQuery, [
      parentId,
      athlete.id,
      athleteData.relationship || 'Parent',
      athleteData.isPrimary !== false,
    ]);

    // Create medical info record
    const medicalQuery = `
      INSERT INTO medical_info (athlete_id, allergies, conditions, medications)
      VALUES ($1, $2, $3, $4)
    `;

    await client.query(medicalQuery, [
      athlete.id,
      medicalData.allergies || 'None',
      medicalData.conditions || 'None',
      medicalData.medications || 'None',
    ]);

    await client.query('COMMIT');

    logger.info(`Athlete created: ${athlete.id} for parent: ${parentId}`);
    return await getAthleteById(athlete.id, parentId);
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create athlete error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update athlete
 */
const updateAthlete = async (athleteId, parentId, updateData) => {
  try {
    // Verify ownership
    await getAthleteById(athleteId, parentId);

    const allowedFields = ['first_name', 'last_name', 'date_of_birth', 'gender', 'jersey_size'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Map camelCase to snake_case
    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      dateOfBirth: 'date_of_birth',
      gender: 'gender',
      jerseySize: 'jersey_size',
    };

    Object.keys(updateData).forEach(key => {
      const dbField = fieldMap[key];
      if (dbField && allowedFields.includes(dbField) && updateData[key] !== undefined) {
        updates.push(`${dbField} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) {
      const error = new Error('No valid fields to update');
      error.statusCode = 400;
      error.code = 'NO_FIELDS_TO_UPDATE';
      throw error;
    }

    values.push(athleteId);

    const query = `
      UPDATE athletes
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    await db.query(query, values);

    logger.info(`Athlete updated: ${athleteId}`);
    return await getAthleteById(athleteId, parentId);
  } catch (error) {
    logger.error('Update athlete error:', error.message);
    throw error;
  }
};

/**
 * Update medical information
 */
const updateMedicalInfo = async (athleteId, parentId, medicalData) => {
  try {
    // Verify ownership
    await getAthleteById(athleteId, parentId);

    const query = `
      UPDATE medical_info
      SET
        allergies = COALESCE($1, allergies),
        conditions = COALESCE($2, conditions),
        medications = COALESCE($3, medications),
        updated_at = CURRENT_TIMESTAMP
      WHERE athlete_id = $4
      RETURNING *
    `;

    const values = [
      medicalData.allergies,
      medicalData.conditions,
      medicalData.medications,
      athleteId,
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      // Create medical info if it doesn't exist
      const insertQuery = `
        INSERT INTO medical_info (athlete_id, allergies, conditions, medications)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const insertValues = [
        athleteId,
        medicalData.allergies || 'None',
        medicalData.conditions || 'None',
        medicalData.medications || 'None',
      ];

      await db.query(insertQuery, insertValues);
    }

    logger.info(`Medical info updated for athlete: ${athleteId}`);
    return await getAthleteById(athleteId, parentId);
  } catch (error) {
    logger.error('Update medical info error:', error.message);
    throw error;
  }
};

/**
 * Add emergency contact
 */
const addEmergencyContact = async (athleteId, parentId, contactData) => {
  try {
    // Verify ownership
    await getAthleteById(athleteId, parentId);

    const query = `
      INSERT INTO emergency_contacts (athlete_id, name, phone, relationship, is_primary)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      athleteId,
      contactData.name,
      contactData.phone,
      contactData.relationship,
      contactData.isPrimary || false,
    ];

    const result = await db.query(query, values);

    logger.info(`Emergency contact added for athlete: ${athleteId}`);
    return result.rows[0];
  } catch (error) {
    logger.error('Add emergency contact error:', error.message);
    throw error;
  }
};

/**
 * Remove emergency contact
 */
const removeEmergencyContact = async (athleteId, parentId, contactId) => {
  try {
    // Verify ownership
    await getAthleteById(athleteId, parentId);

    const query = `
      DELETE FROM emergency_contacts
      WHERE id = $1 AND athlete_id = $2
      RETURNING id
    `;

    const result = await db.query(query, [contactId, athleteId]);

    if (result.rows.length === 0) {
      const error = new Error('Emergency contact not found');
      error.statusCode = 404;
      error.code = 'CONTACT_NOT_FOUND';
      throw error;
    }

    logger.info(`Emergency contact removed: ${contactId}`);
    return { id: contactId };
  } catch (error) {
    logger.error('Remove emergency contact error:', error.message);
    throw error;
  }
};

/**
 * Delete athlete (soft delete)
 */
const deleteAthlete = async (athleteId, parentId) => {
  try {
    // Verify ownership
    await getAthleteById(athleteId, parentId);

    // Check for active enrollments
    const enrollmentCheck = await db.query(
      `SELECT COUNT(*) as count FROM enrollments
       WHERE athlete_id = $1 AND status = 'active'`,
      [athleteId]
    );

    if (parseInt(enrollmentCheck.rows[0].count) > 0) {
      const error = new Error('Cannot delete athlete with active enrollments');
      error.statusCode = 400;
      error.code = 'ACTIVE_ENROLLMENTS_EXIST';
      throw error;
    }

    const query = `
      UPDATE athletes
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    await db.query(query, [athleteId]);

    logger.info(`Athlete deleted: ${athleteId}`);
    return { id: athleteId };
  } catch (error) {
    logger.error('Delete athlete error:', error.message);
    throw error;
  }
};

module.exports = {
  getMyAthletes,
  getAthleteById,
  createAthlete,
  updateAthlete,
  updateMedicalInfo,
  addEmergencyContact,
  removeEmergencyContact,
  deleteAthlete,
};
