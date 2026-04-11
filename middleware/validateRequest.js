const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path,
    message: e.msg,
    value: e.value !== undefined ? e.value : undefined,
  }));

  return res.status(400).json({
    success: false,
    message: 'Validation failed. Please check the fields below.',
    errors,
  });
}

module.exports = validateRequest;
