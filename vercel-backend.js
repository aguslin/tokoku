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
require('pg');
require('pg-hstore');

// Load environment variables from backend/.env (if file exists on Vercel)
require('dotenv').config({ path: path.join(backendDir, '.env') });

// Set defaults for required env vars if not already set
// (backend/.env is gitignored, so these act as Vercel defaults)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_EZ91WmoXrwyf@ep-noisy-bonus-aokfl0ci-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
}
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'tokoku_jwt_secret_2024_production_key';
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = 'tokoku_jwt_refresh_secret_2024_production_key';
if (!process.env.JWT_EXPIRES_IN) process.env.JWT_EXPIRES_IN = '15m';
if (!process.env.JWT_REFRESH_EXPIRES_IN) process.env.JWT_REFRESH_EXPIRES_IN = '7d';
if (!process.env.CORS_ORIGIN) process.env.CORS_ORIGIN = '*';

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

  // Vercel experimentalServices routePrefix is NOT stripped from req.url.
  // Express routes are mounted at /api/v1, but Vercel sends the full path
  // including /_/backend prefix. Strip it here so Express sees the correct path.
  const prefix = '/_/backend';
  if (req.url && req.url.startsWith(prefix)) {
    req.url = req.url.slice(prefix.length) || '/';
  }

  return app(req, res);
};
