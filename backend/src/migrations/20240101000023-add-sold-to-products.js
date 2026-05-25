'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'sold', {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('products', 'sold');
  },
};
