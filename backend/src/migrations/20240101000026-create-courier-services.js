'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('courier_services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      courierId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'couriers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING, allowNull: false },
      code: { type: Sequelize.STRING, allowNull: false },
      cost: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
      estimatedDaysMin: { type: Sequelize.INTEGER },
      estimatedDaysMax: { type: Sequelize.INTEGER },
      isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('courier_services', ['courierId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('courier_services');
  },
};
