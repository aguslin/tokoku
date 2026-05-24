'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vouchers', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      code: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
      },
      type: {
        type: Sequelize.DataTypes.STRING,
      },
      value: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      minOrder: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      maxDiscount: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      usageLimit: {
        type: Sequelize.DataTypes.INTEGER,
      },
      usedCount: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      startsAt: {
        type: Sequelize.DataTypes.DATE,
      },
      endsAt: {
        type: Sequelize.DataTypes.DATE,
      },
      isActive: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DataTypes.DATE,
      },
    });

    await queryInterface.addIndex('vouchers', ['code']);
    await queryInterface.addIndex('vouchers', ['isActive']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('vouchers');
  },
};
