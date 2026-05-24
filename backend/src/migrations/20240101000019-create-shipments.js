'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      courierId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'couriers',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      addressId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      trackingNumber: {
        type: Sequelize.DataTypes.STRING,
      },
      service: {
        type: Sequelize.DataTypes.STRING,
      },
      cost: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      status: {
        type: Sequelize.DataTypes.STRING,
      },
      shippedAt: {
        type: Sequelize.DataTypes.DATE,
      },
      deliveredAt: {
        type: Sequelize.DataTypes.DATE,
      },
      createdAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('shipments', ['orderId']);
    await queryInterface.addIndex('shipments', ['courierId']);
    await queryInterface.addIndex('shipments', ['addressId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('shipments');
  },
};
