require('dotenv').config();

const app = require('./app');
const appConfig = require('./src/config/app');
const logger = require('./src/config/logger');
const { sequelize } = require('./src/models');

let server;

const { Umzug, SequelizeStorage } = require('umzug');
const SequelizeLib = require('sequelize');

async function runMigrations() {
  const umzug = new Umzug({
    migrations: {
      glob: 'src/migrations/*.js',
      resolve: ({ name, path, context }) => {
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context.queryInterface, context.Sequelize),
          down: async () => migration.down && migration.down(context.queryInterface, context.Sequelize),
        };
      },
    },
    context: {
      queryInterface: sequelize.getQueryInterface(),
      Sequelize: SequelizeLib,
    },
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  const pending = await umzug.pending();
  if (pending.length > 0) {
    logger.info(`Running ${pending.length} pending migrations...`);
    await umzug.up();
    logger.info('Migrations completed.');
  } else {
    logger.info('No pending migrations.');
  }
}

async function startServer() {
  try {
    if (!appConfig.isTest) {
      await sequelize.authenticate();
      logger.info('Database connection established successfully.');

      await runMigrations();
    }

    server = app.listen(appConfig.port, () => {
      logger.info(`Server running on port ${appConfig.port} in ${appConfig.nodeEnv} mode`);
      logger.info(`API docs available at http://localhost:${appConfig.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      logger.info('Process terminated.');
      process.exit(0);
    });
  }
});
