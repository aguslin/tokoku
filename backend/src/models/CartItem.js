'use strict';

module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'carts',
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
      defaultValue: 1,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
  }, {
    tableName: 'cart_items',
    timestamps: true,
    indexes: [
      {
        fields: ['cartId'],
      },
      {
        fields: ['productId'],
      },
      {
        fields: ['variantId'],
      },
    ],
  });

  CartItem.associate = (db) => {
    CartItem.belongsTo(db.Cart, { foreignKey: 'cartId' });
    CartItem.belongsTo(db.Product, { foreignKey: 'productId' });
    CartItem.belongsTo(db.ProductVariant, { foreignKey: 'variantId' });
  };

  return CartItem;
};
