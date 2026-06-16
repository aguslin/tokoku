'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('shipments', 'warehouseId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'warehouses', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('shipments', 'warehouseId');
  },
};
