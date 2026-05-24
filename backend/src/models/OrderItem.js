'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
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
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productImage: {
      type: DataTypes.STRING,
    },
    variantName: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
    },
    quantity: {
      type: DataTypes.INTEGER,
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
    },
  }, {
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['productId'],
      },
      {
        fields: ['variantId'],
      },
    ],
  });

  OrderItem.associate = (db) => {
    OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });
    OrderItem.belongsTo(db.Product, { foreignKey: 'productId' });
    OrderItem.belongsTo(db.ProductVariant, { foreignKey: 'variantId' });
  };

  return OrderItem;
};
