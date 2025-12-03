const { validationResult } = require('express-validator');

/**
 * Validate Request
 * Middleware to check validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path ||error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: formattedErrors,
      },
    });
  }

  next();
};

module.exports = { validate };
