'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'courierServiceId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'courier_services', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('orders', 'courierServiceId');
  },
};
