'use strict';

const { v4: uuidv4 } = require('uuid');

const resources = ['users', 'products', 'categories', 'orders', 'vouchers', 'reviews'];
const actions = ['create', 'read', 'update', 'delete'];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const permissions = [];

    for (const resource of resources) {
      for (const action of actions) {
        permissions.push({
          id: uuidv4(),
          name: `${action}_${resource}`,
          resource,
          action,
          description: `${action} ${resource}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    permissions.push({
      id: uuidv4(),
      name: 'manage_all',
      resource: 'all',
      action: 'manage',
      description: 'Akses penuh ke semua resource',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await queryInterface.bulkInsert('permissions', permissions);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', {
      name: {
        [Sequelize.Op.in]: [
          ...resources.flatMap((r) => actions.map((a) => `${a}_${r}`)),
          'manage_all',
        ],
      },
    });
  },
};
