// Vercel serverless function handler for the backend service
// This file must be a self-contained entrypoint that loads the Express app.

// Ensure environment variables are loaded
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

// Set NODE_ENV if not set
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

let app;
let appError = null;

try {
  app = require('../app');
} catch (err) {
  appError = err;
  console.error('Failed to load Express app:', err.message);
  console.error('Stack:', err.stack);
}

let isConnected = false;

async function ensureConnection() {
  if (!isConnected && !appError) {
    try {
      const { sequelize } = require('../src/models');
      await sequelize.authenticate();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error:', err.message);
    }
  }
}

module.exports = async (req, res) => {
  // If app failed to load, return error immediately
  if (appError) {
    return res.status(500).json({
      success: false,
      message: 'Backend initialization failed',
      error: appError.message,
      stack: process.env.NODE_ENV === 'development' ? appError.stack : undefined,
    });
  }

  try {
    await ensureConnection();
  } catch (err) {
    console.error('Connection error:', err.message);
  }

  // Pass the request to Express
  return app(req, res);
};
