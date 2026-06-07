const appConfig = require('./app');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = appConfig.corsOrigin.split(',').map((o) => o.trim());
    // Handle wildcard — allow all origins when CORS_ORIGIN is "*"
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || appConfig.isDev) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Refresh-Token'],
  maxAge: 86400,
};

module.exports = corsOptions;
