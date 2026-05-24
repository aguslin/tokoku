'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('admin@marketplace.com', 'user@marketplace.com')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE name IN ('admin', 'user')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const adminUser = users.find((u) => u.email === 'admin@marketplace.com');
    const regularUser = users.find((u) => u.email === 'user@marketplace.com');
    const adminRole = roles.find((r) => r.name === 'admin');
    const userRole = roles.find((r) => r.name === 'user');

    await queryInterface.bulkInsert('user_roles', [
      {
        id: uuidv4(),
        userId: adminUser.id,
        roleId: adminRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        userId: regularUser.id,
        roleId: userRole.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('user_roles', {
      userId: {
        [Sequelize.Op.in]: Sequelize.literal(
          `(SELECT id FROM users WHERE email IN ('admin@marketplace.com', 'user@marketplace.com'))`
        ),
      },
    });
  },
};
