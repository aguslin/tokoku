const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const ApiError = require('../utils/ApiError');
const appConfig = require('../config/app');
const { USER_ROLES } = require('../constants');

const authenticate = async (req, _res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required. Please provide a valid token.');
    }

    const decoded = await promisify(jwt.verify)(token, appConfig.jwt.secret);

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Token has expired.'));
    }
    return next(ApiError.unauthorized('Authentication failed.'));
  }
};

const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    const userRole = req.user.role || req.user.roles;
    const userRoles = Array.isArray(userRole) ? userRole : [userRole];

    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }

    next();
  };
};

const checkPermission = (resource, action) => {
  return async (req, _res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    const permissions = req.user.permissions;
    if (!permissions) {
      return next(ApiError.forbidden('No permissions found.'));
    }

    const hasPermission = permissions.some(
      (perm) => perm.resource === resource && perm.action === action,
    );

    if (!hasPermission) {
      return next(ApiError.forbidden(`Missing permission: ${action}:${resource}`));
    }

    next();
  };
};

module.exports = { authenticate, authorize, checkPermission };
