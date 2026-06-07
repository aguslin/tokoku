// Vercel serverless function handler for the backend service
let app;
let sequelize;

// Cache the sequelize connection across Vercel invocations
let isConnected = false;

async function ensureConnection() {
  if (!isConnected && sequelize) {
    try {
      await sequelize.authenticate();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error:', err.message);
    }
  }
}

async function handler(req, res) {
  // Lazy-load modules to catch initialization errors gracefully
  if (!app) {
    try {
      app = require('../app');
      const db = require('../src/models');
      sequelize = db.sequelize;
    } catch (err) {
      console.error('Failed to initialize backend:', err);
      return res.status(503).json({
        success: false,
        message: 'Backend initialization failed',
        error: err.message,
        stack: err.stack ? err.stack.split('\n').slice(0, 10) : undefined,
      });
    }
  }

  try {
    await ensureConnection();
  } catch (err) {
    console.error('Database connection error:', err.message);
  }

  // Pass the request to Express
  return app(req, res);
}

module.exports = handler;
