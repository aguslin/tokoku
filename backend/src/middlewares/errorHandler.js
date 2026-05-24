const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const appConfig = require('../config/app');

const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  logger.error(err.message, {
    stack: err.stack,
    statusCode: err.statusCode || 500,
    ...(err.errors && { errors: err.errors }),
  });

  if (err instanceof ApiError) {
    error.statusCode = err.statusCode;
    error.isOperational = err.isOperational;
    error.errors = err.errors;
  }

  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    error.statusCode = 400;
    error.message = 'Validation error';
    error.errors = err.errors?.map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.statusCode = 400;
    error.message = 'Invalid reference. The referenced record does not exist.';
  }

  if (err.name === 'SequelizeDatabaseError') {
    error.statusCode = 500;
    error.message = 'Database error occurred.';
  }

  if (err.name === 'JsonWebTokenError') {
    error.statusCode = 401;
    error.message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    error.statusCode = 401;
    error.message = 'Token has expired.';
  }

  if (err.name === 'MulterError') {
    error.statusCode = 400;

    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'File too large. Maximum size is 5MB.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error.message = 'Too many files uploaded.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      error.message = 'Unexpected file field.';
    } else {
      error.message = err.message || 'File upload error.';
    }
  }

  if (err.name === 'ValidationError') {
    error.statusCode = 422;
    error.message = 'Validation failed';
    error.errors = err.errors || err.details;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const isOperational = error.isOperational !== undefined ? error.isOperational : statusCode < 500;

  const response = {
    success: false,
    message,
    ...(error.errors && { errors: error.errors }),
    ...(appConfig.isDev && { stack: error.stack }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
