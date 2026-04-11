const AppError = require('../util/AppError');

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Database validation failed.',
      errors: messages,
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
      field: err.errors?.[0]?.path,
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message:
        'Invalid reference: the related state, city, community, user, or kutumb does not exist.',
    });
  }

  if (err.name === 'SequelizeDatabaseError') {
    return res.status(400).json({
      success: false,
      message: err.parent?.sqlMessage || err.message || 'Database error.',
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please sign in again.',
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: 'Something went wrong on the server. Please try again later.',
  });
}

module.exports = errorHandler;
