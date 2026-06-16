'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('warehouses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      address: { type: Sequelize.TEXT },
      city: { type: Sequelize.STRING, allowNull: false },
      province: { type: Sequelize.STRING, allowNull: false },
      latitude: { type: Sequelize.DECIMAL(10, 7) },
      longitude: { type: Sequelize.DECIMAL(10, 7) },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('warehouses');
  },
};
