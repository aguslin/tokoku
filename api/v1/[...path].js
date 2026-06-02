const app = require('../../backend/app');
const { sequelize } = require('../../backend/src/models');

// Cache the sequelize connection across invocations
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    await sequelize.authenticate();
    isConnected = true;
  }
}

// Vercel serverless function handler
module.exports = async (req, res) => {
  try {
    await ensureConnection();
  } catch (err) {
    console.error('Database connection error:', err);
  }

  // Pass the request to Express
  return app(req, res);
};
