'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
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
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.DataTypes.TEXT,
      },
      type: {
        type: Sequelize.DataTypes.STRING,
      },
      referenceId: {
        type: Sequelize.DataTypes.UUID,
      },
      referenceType: {
        type: Sequelize.DataTypes.STRING,
      },
      isRead: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      readAt: {
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

    await queryInterface.addIndex('notifications', ['userId']);
    await queryInterface.addIndex('notifications', ['isRead']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('notifications');
  },
};
