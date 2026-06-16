const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function parseDatabaseUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      username: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1),
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
    };
  } catch {
    return null;
  }
}

const neonConfig = parseDatabaseUrl(process.env.DATABASE_URL);

// When DATABASE_URL points at a cloud Postgres (e.g. Neon), SSL is required.
// This lets us develop locally against Neon without Docker / local Postgres.
const neonSsl = neonConfig
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : undefined;

module.exports = {
  development: {
    username: neonConfig?.username || process.env.DB_USER || 'postgres',
    password: neonConfig?.password || process.env.DB_PASSWORD || 'postgres',
    database: neonConfig?.database || process.env.DB_NAME || 'marketplace',
    host: neonConfig?.host || process.env.DB_HOST || 'localhost',
    port: neonConfig?.port || parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: console.log,
    ...(neonSsl ? { dialectOptions: neonSsl } : {}),
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
  },
  test: {
    username: neonConfig?.username || process.env.DB_USER || 'postgres',
    password: neonConfig?.password || process.env.DB_PASSWORD || 'postgres',
    database: `${neonConfig?.database || process.env.DB_NAME || 'marketplace'}_test`,
    host: neonConfig?.host || process.env.DB_HOST || 'localhost',
    port: neonConfig?.port || parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
  },
  production: {
    username: neonConfig?.username || process.env.DB_USER,
    password: neonConfig?.password || process.env.DB_PASSWORD,
    database: neonConfig?.database || process.env.DB_NAME,
    host: neonConfig?.host || process.env.DB_HOST,
    port: neonConfig?.port || parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    seederStorage: 'sequelize',
    seederStorageTableName: 'SequelizeData',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
};
