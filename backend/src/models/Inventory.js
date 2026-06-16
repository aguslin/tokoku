'use strict';

module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define('Inventory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    warehouseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'warehouses',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'product_variants',
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    reservedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'inventory',
    timestamps: true,
    indexes: [
      { fields: ['warehouseId'] },
      { fields: ['productId'] },
    ],
  });

  Inventory.associate = (db) => {
    Inventory.belongsTo(db.Warehouse, { foreignKey: 'warehouseId' });
    Inventory.belongsTo(db.Product, { foreignKey: 'productId' });
    Inventory.belongsTo(db.ProductVariant, { foreignKey: 'variantId' });
  };

  return Inventory;
};
