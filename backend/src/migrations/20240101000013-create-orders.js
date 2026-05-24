'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
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
      orderNumber: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: 'pending',
      },
      subtotal: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      shippingCost: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      voucherDiscount: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      total: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      notes: {
        type: Sequelize.DataTypes.TEXT,
      },
      paidAt: {
        type: Sequelize.DataTypes.DATE,
      },
      deliveredAt: {
        type: Sequelize.DataTypes.DATE,
      },
      cancelledAt: {
        type: Sequelize.DataTypes.DATE,
      },
      cancellationReason: {
        type: Sequelize.DataTypes.TEXT,
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
      courierService: {
        type: Sequelize.DataTypes.STRING,
      },
      trackingNumber: {
        type: Sequelize.DataTypes.STRING,
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

    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['addressId']);
    await queryInterface.addIndex('orders', ['courierId']);
    await queryInterface.addIndex('orders', ['orderNumber']);
    await queryInterface.addIndex('orders', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
  },
};
