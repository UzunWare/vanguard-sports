const athleteService = require('../services/athlete.service');
const logger = require('../utils/logger');

/**
 * Get all athletes for current parent
 * GET /api/athletes/my-athletes
 */
const getMyAthletes = async (req, res, next) => {
  try {
    const athletes = await athleteService.getMyAthletes(req.user.id);

    res.status(200).json({
      athletes,
      total: athletes.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get athlete by ID
 * GET /api/athletes/:id
 */
const getAthleteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const athlete = await athleteService.getAthleteById(id, req.user.id);

    res.status(200).json({
      athlete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new athlete
 * POST /api/athletes
 */
const createAthlete = async (req, res, next) => {
  try {
    const { firstName, lastName, dateOfBirth, gender, jerseySize, relationship, isPrimary } = req.body;
    const { allergies, conditions, medications } = req.body;

    const athleteData = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      jerseySize,
      relationship,
      isPrimary,
    };

    const medicalData = {
      allergies,
      conditions,
      medications,
    };

    const athlete = await athleteService.createAthlete(req.user.id, athleteData, medicalData);

    res.status(201).json({
      message: 'Athlete created successfully',
      athlete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update athlete
 * PATCH /api/athletes/:id
 */
const updateAthlete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, dateOfBirth, gender, jerseySize } = req.body;

    const updateData = {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      jerseySize,
    };

    const athlete = await athleteService.updateAthlete(id, req.user.id, updateData);

    res.status(200).json({
      message: 'Athlete updated successfully',
      athlete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update medical information
 * PATCH /api/athletes/:id/medical
 */
const updateMedicalInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { allergies, conditions, medications } = req.body;

    const medicalData = {
      allergies,
      conditions,
      medications,
    };

    const athlete = await athleteService.updateMedicalInfo(id, req.user.id, medicalData);

    res.status(200).json({
      message: 'Medical information updated successfully',
      athlete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add emergency contact
 * POST /api/athletes/:id/emergency-contacts
 */
const addEmergencyContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, relationship, isPrimary } = req.body;

    const contactData = {
      name,
      phone,
      relationship,
      isPrimary,
    };

    const contact = await athleteService.addEmergencyContact(id, req.user.id, contactData);

    res.status(201).json({
      message: 'Emergency contact added successfully',
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove emergency contact
 * DELETE /api/athletes/:id/emergency-contacts/:contactId
 */
const removeEmergencyContact = async (req, res, next) => {
  try {
    const { id, contactId } = req.params;

    await athleteService.removeEmergencyContact(id, req.user.id, contactId);

    res.status(200).json({
      message: 'Emergency contact removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete athlete
 * DELETE /api/athletes/:id
 */
const deleteAthlete = async (req, res, next) => {
  try {
    const { id } = req.params;

    await athleteService.deleteAthlete(id, req.user.id);

    res.status(200).json({
      message: 'Athlete deleted successfully',
    });
  } catch (error) {
    next(error);
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
