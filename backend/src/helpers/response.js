const ApiResponse = require('../utils/ApiResponse');

const sendSuccess = (res, data, message, statusCode = 200, meta = null) => {
  return ApiResponse.success(res, data, message, statusCode, meta);
};

const sendCreated = (res, data, message = 'Created successfully') => {
  return ApiResponse.created(res, data, message);
};

const sendError = (res, message, statusCode = 500, errors = null) => {
  return ApiResponse.error(res, message, statusCode, errors);
};

const sendNoContent = (res) => {
  return ApiResponse.noContent(res);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendNoContent,
};
