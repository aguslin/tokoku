'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('payments', {
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
      paymentMethodId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'payment_methods',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: 'pending',
      },
      paidAt: {
        type: Sequelize.DataTypes.DATE,
      },
      expiredAt: {
        type: Sequelize.DataTypes.DATE,
      },
      transactionId: {
        type: Sequelize.DataTypes.STRING,
      },
      metadata: {
        type: Sequelize.DataTypes.JSONB,
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

    await queryInterface.addIndex('payments', ['orderId']);
    await queryInterface.addIndex('payments', ['paymentMethodId']);
    await queryInterface.addIndex('payments', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('payments');
  },
};
