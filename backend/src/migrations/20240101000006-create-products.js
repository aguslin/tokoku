'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.DataTypes.TEXT,
      },
      price: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      comparePrice: {
        type: Sequelize.DataTypes.DECIMAL(15, 2),
      },
      stock: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      sku: {
        type: Sequelize.DataTypes.STRING,
      },
      weight: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
      },
      isActive: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isFeatured: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false,
      },
      categoryId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sellerId: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('products', ['categoryId']);
    await queryInterface.addIndex('products', ['sellerId']);
    await queryInterface.addIndex('products', ['slug']);
    await queryInterface.addIndex('products', ['isActive']);
    await queryInterface.addIndex('products', ['isFeatured']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('products');
  },
};
