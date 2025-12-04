/**
 * Announcement Service
 * Handles announcement creation and email distribution to parents
 */

const db = require('../config/database');
const emailService = require('./email.service');
const logger = require('../utils/logger');

/**
 * Create and send announcement to parents
 * @param {Object} announcementData - { title, message, senderId, senderRole, targetAudience, sessionId }
 */
const createAnnouncement = async (announcementData) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const { title, message, senderId, senderRole, targetAudience, sessionId } = announcementData;

    // Create announcement record
    const announcementQuery = `
      INSERT INTO announcements (
        title, message, sender_id, sender_role,
        target_audience, session_id, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const announcementResult = await client.query(announcementQuery, [
      title,
      message,
      senderId,
      senderRole,
      targetAudience || 'all',
      sessionId || null,
    ]);

    const announcement = announcementResult.rows[0];

    // Get parent emails based on target audience
    let parentEmails = [];

    if (targetAudience === 'session' && sessionId) {
      // Get parents of athletes enrolled in specific session
      const sessionParentsQuery = `
        SELECT DISTINCT u.email, u.first_name, u.last_name, s.sport, s.level
        FROM users u
        INNER JOIN athletes a ON u.id = a.parent_id
        INNER JOIN enrollments e ON a.id = e.athlete_id
        INNER JOIN sessions s ON e.session_id = s.id
        WHERE e.session_id = $1
          AND e.status IN ('confirmed', 'pending')
          AND u.role = 'parent'
      `;
      const result = await client.query(sessionParentsQuery, [sessionId]);
      parentEmails = result.rows;
    } else if (targetAudience === 'coach-sessions' && sessionId) {
      // Get parents from all sessions coached by this coach
      const coachSessionsQuery = `
        SELECT DISTINCT u.email, u.first_name, u.last_name, s.sport, s.level
        FROM users u
        INNER JOIN athletes a ON u.id = a.parent_id
        INNER JOIN enrollments e ON a.id = e.athlete_id
        INNER JOIN sessions s ON e.session_id = s.id
        WHERE s.coach_id = $1
          AND e.status IN ('confirmed', 'pending')
          AND u.role = 'parent'
      `;
      const result = await client.query(coachSessionsQuery, [senderId]);
      parentEmails = result.rows;
    } else {
      // Get all parents (admin broadcasting to everyone)
      const allParentsQuery = `
        SELECT DISTINCT email, first_name, last_name
        FROM users
        WHERE role = 'parent'
      `;
      const result = await client.query(allParentsQuery);
      parentEmails = result.rows;
    }

    await client.query('COMMIT');

    // Send emails in background (don't wait)
    (async () => {
      try {
        // Get sender name
        const senderQuery = await db.query(
          'SELECT first_name, last_name FROM users WHERE id = $1',
          [senderId]
        );
        const senderName = senderQuery.rows.length > 0
          ? `${senderQuery.rows[0].first_name} ${senderQuery.rows[0].last_name}`
          : 'Vanguard Sports Academy';

        // Send to all parents
        for (const parent of parentEmails) {
          await emailService.sendAnnouncementEmail({
            email: parent.email,
            parentName: `${parent.first_name} ${parent.last_name}`,
            senderName,
            senderRole: senderRole === 'admin' ? 'Administrator' : 'Coach',
            title,
            message,
            sessionInfo: parent.sport && parent.level
              ? `${parent.sport} - ${parent.level}`
              : null,
          });
        }

        logger.info(`✅ Announcement sent to ${parentEmails.length} parents: "${title}"`);
      } catch (emailError) {
        logger.error('Failed to send announcement emails:', emailError);
      }
    })();

    return {
      announcement,
      recipientCount: parentEmails.length,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create announcement error:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get announcements history
 * @param {Object} filters - { senderId, senderRole, limit }
 */
const getAnnouncements = async (filters = {}) => {
  try {
    let query = `
      SELECT
        a.*,
        u.first_name || ' ' || u.last_name as sender_name,
        s.sport,
        s.level,
        s.day_of_week,
        s.start_time
      FROM announcements a
      INNER JOIN users u ON a.sender_id = u.id
      LEFT JOIN sessions s ON a.session_id = s.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (filters.senderId) {
      query += ` AND a.sender_id = $${paramCount}`;
      params.push(filters.senderId);
      paramCount++;
    }

    if (filters.senderRole) {
      query += ` AND a.sender_role = $${paramCount}`;
      params.push(filters.senderRole);
      paramCount++;
    }

    // Coaches can only see their own announcements
    if (filters.coachId) {
      query += ` AND (a.sender_id = $${paramCount} OR a.sender_role = 'admin')`;
      params.push(filters.coachId);
      paramCount++;
    }

    query += ` ORDER BY a.created_at DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await db.query(query, params);

    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      message: row.message,
      senderName: row.sender_name,
      senderRole: row.sender_role,
      targetAudience: row.target_audience,
      sessionInfo: row.sport && row.level
        ? `${row.sport} - ${row.level} (${row.day_of_week} ${row.start_time})`
        : null,
      createdAt: row.created_at,
    }));
  } catch (error) {
    logger.error('Get announcements error:', error.message);
    throw error;
  }
};

/**
 * Get sessions for coach (for announcement targeting)
 */
const getCoachSessions = async (coachId) => {
  try {
    const query = `
      SELECT
        id,
        sport,
        level,
        day_of_week,
        start_time,
        end_time,
        (SELECT COUNT(*) FROM enrollments WHERE session_id = sessions.id AND status IN ('confirmed', 'pending')) as enrolled_count
      FROM sessions
      WHERE coach_id = $1
      ORDER BY day_of_week, start_time
    `;

    const result = await db.query(query, [coachId]);

    return result.rows.map(row => ({
      id: row.id,
      sport: row.sport,
      level: row.level,
      schedule: `${row.day_of_week} ${row.start_time}-${row.end_time}`,
      enrolledCount: parseInt(row.enrolled_count),
    }));
  } catch (error) {
    logger.error('Get coach sessions error:', error.message);
    throw error;
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getCoachSessions,
};
