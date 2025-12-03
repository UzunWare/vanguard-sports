const evaluationService = require('../services/evaluation.service');
const logger = require('../utils/logger');

/**
 * Get evaluations
 * GET /api/evaluations
 */
const getEvaluations = async (req, res, next) => {
  try {
    const { athleteId, sessionId } = req.query;

    const filters = {
      athleteId,
      sessionId,
    };

    const evaluations = await evaluationService.getEvaluations(req.user.id, req.user.role, filters);

    res.status(200).json({
      evaluations,
      total: evaluations.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get evaluation by ID
 * GET /api/evaluations/:id
 */
const getEvaluationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await evaluationService.getEvaluationById(id, req.user.id, req.user.role);

    res.status(200).json({
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create evaluation (coach only)
 * POST /api/evaluations
 */
const createEvaluation = async (req, res, next) => {
  try {
    const {
      athleteId,
      sessionId,
      evaluationDate,
      notes,
      ratings,
    } = req.body;

    const evaluationData = {
      athleteId,
      sessionId,
      evaluationDate,
      notes,
      ratings,
    };

    const evaluation = await evaluationService.createEvaluation(req.user.id, evaluationData);

    res.status(201).json({
      message: 'Evaluation created successfully',
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update evaluation (coach only)
 * PATCH /api/evaluations/:id
 */
const updateEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      evaluationDate,
      notes,
      ratings,
    } = req.body;

    const updateData = {
      evaluationDate,
      notes,
      ratings,
    };

    const evaluation = await evaluationService.updateEvaluation(id, req.user.id, updateData);

    res.status(200).json({
      message: 'Evaluation updated successfully',
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete evaluation (coach only)
 * DELETE /api/evaluations/:id
 */
const deleteEvaluation = async (req, res, next) => {
  try {
    const { id } = req.params;

    await evaluationService.deleteEvaluation(id, req.user.id);

    res.status(200).json({
      message: 'Evaluation deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
};
