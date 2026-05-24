'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      label: {
        type: Sequelize.DataTypes.STRING,
      },
      recipientName: {
        type: Sequelize.DataTypes.STRING,
      },
      recipientPhone: {
        type: Sequelize.DataTypes.STRING,
      },
      street: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
      },
      district: {
        type: Sequelize.DataTypes.STRING,
      },
      city: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      province: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      postalCode: {
        type: Sequelize.DataTypes.STRING,
      },
      latitude: {
        type: Sequelize.DataTypes.DECIMAL(10, 7),
      },
      longitude: {
        type: Sequelize.DataTypes.DECIMAL(10, 7),
      },
      isPrimary: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('addresses', ['userId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('addresses');
  },
};
