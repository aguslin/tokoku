const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const appConfig = require('./src/config/app');
const corsOptions = require('./src/config/cors');
const logger = require('./src/config/logger');
const swaggerSpec = require('./src/docs/swagger');
const ApiError = require('./src/utils/ApiError');
const ApiResponse = require('./src/utils/ApiResponse');
const { HTTP_STATUS } = require('./src/constants');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const morganFormat = appConfig.isDev ? 'dev' : 'combined';
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  }),
);

app.use(
  '/uploads',
  express.static(path.resolve(__dirname, 'storage', 'uploads'), {
    maxAge: '1d',
    etag: true,
  }),
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: 'Marketplace API Docs',
}));

app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

const routes = require('./src/routes');
app.use('/api/v1', routes);

app.use((_req, _res, next) => {
  next(ApiError.notFound('Route not found'));
});

app.use((err, _req, res, _next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let errors = null;

  if (err.errors && Array.isArray(err.errors)) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    errors = err.errors.map((e) => e.msg || e.message || e);
  }

  if (err.name === 'SequelizeValidationError') {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    errors = err.errors.map((e) => e.message);
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = HTTP_STATUS.CONFLICT;
    message = 'Resource already exists';
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }

  if (err.name === 'MulterError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = err.message;
  }

  if (!appConfig.isDev && !err.isOperational) {
    statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = 'Internal server error';
  }

  if (appConfig.isDev) {
    logger.error(`${statusCode} - ${message}`, {
      stack: err.stack,
      url: _req.originalUrl,
      method: _req.method,
    });
  }

  return ApiResponse.error(res, message, statusCode, errors);
});

module.exports = app;
