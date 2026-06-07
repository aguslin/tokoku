const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const appConfig = require('./src/config/app');
const corsOptions = require('./src/config/cors');
const logger = require('./src/config/logger');
const ApiError = require('./src/utils/ApiError');
const ApiResponse = require('./src/utils/ApiResponse');
const { HTTP_STATUS } = require('./src/constants');

const isVercel = !!process.env.VERCEL;

const app = express();

// Skip helmet on Vercel — it manipulates raw ServerResponse headers
// in ways incompatible with Vercel's serverless function response objects.
// Vercel already handles security headers at the edge.
if (!isVercel) {
  const helmet = require('helmet');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Skip morgan on Vercel — it needs req.socket.remoteAddress which
// may not be available. Vercel has its own request logging.
if (!isVercel) {
  const morgan = require('morgan');
  const morganFormat = appConfig.isDev ? 'dev' : 'combined';
  app.use(
    morgan(morganFormat, {
      stream: { write: (message) => logger.http(message.trim()) },
    }),
  );
}

// Only serve static uploads when not on Vercel (read-only filesystem)
if (!isVercel) {
  app.use(
    '/uploads',
    express.static(path.resolve(__dirname, 'storage', 'uploads'), {
      maxAge: '1d',
      etag: true,
    }),
  );
}

// Skip swagger-ui on Vercel (not needed in serverless)
if (!isVercel) {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./src/docs/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Marketplace API Docs',
  }));
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

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

  const responsePayload = {
    success: false,
    message,
  };
  if (errors) responsePayload.errors = errors;

  // Include real error details on Vercel for debugging
  if (!appConfig.isDev && err.message && !err.isOperational) {
    responsePayload.debug = { error: err.message, name: err.name };
  }

  return res.status(statusCode).json(responsePayload);
});

module.exports = app;
