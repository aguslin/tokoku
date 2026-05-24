'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      url: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      alt: {
        type: Sequelize.DataTypes.STRING,
      },
      isPrimary: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sortOrder: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
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

    await queryInterface.addIndex('product_images', ['productId']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('product_images');
  },
};
