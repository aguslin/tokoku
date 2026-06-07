'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'weightUom', {
      type: Sequelize.DataTypes.STRING,
      defaultValue: 'kg',
      allowNull: true,
      comment: 'Unit of measurement for weight: kg or gram',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'weightUom');
  },
};
