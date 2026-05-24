'use strict';

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPassword = bcrypt.hashSync('Admin123!', 10);
    const userPassword = bcrypt.hashSync('User123!', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@marketplace.com',
        password: adminPassword,
        name: 'Admin Marketplace',
        phone: '081234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        email: 'user@marketplace.com',
        password: userPassword,
        name: 'Budi Santoso',
        phone: '081298765432',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', {
      email: { [Sequelize.Op.in]: ['admin@marketplace.com', 'user@marketplace.com'] },
    });
  },
};
