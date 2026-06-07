// Vercel serverless handler for the backend Express service.
// This file lives at the project root so @vercel/node installs deps from
// root package.json (which includes all backend dependencies).
//
// IMPORTANT: Sequelize loads dialect packages (pg) dynamically at runtime.
// @vercel/ncc cannot trace dynamic requires, so we explicitly require them
// here to force ncc to include them in the bundle.

const path = require('path');
const backendDir = path.resolve(__dirname, 'backend');

// Force ncc to bundle the PostgreSQL dialect packages
// (Sequelize loads them via string matching, not static require)
require('pg');
require('pg-hstore');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(backendDir, '.env') });

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';

// Load the Express app
let app;
let appError = null;

try {
  app = require(path.join(backendDir, 'app'));
} catch (err) {
  appError = err;
  console.error('Failed to load Express app:', err.message);
  console.error('Stack:', err.stack);
}

// Cache the Sequelize connection across Vercel cold starts
let isConnected = false;

async function ensureConnection() {
  if (!isConnected && !appError) {
    try {
      const modelsPath = path.join(backendDir, 'src/models');
      const { sequelize } = require(modelsPath);
      await sequelize.authenticate();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error:', err.message);
    }
  }
}

module.exports = async (req, res) => {
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
    // DB connection failed — continue anyway, let the request handle the error
  }

  return app(req, res);
};
