'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProductVariant = sequelize.define('ProductVariant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'product_variants',
    timestamps: true,
    indexes: [
      {
        fields: ['productId'],
      },
    ],
  });

  ProductVariant.associate = (db) => {
    ProductVariant.belongsTo(db.Product, { foreignKey: 'productId' });
    ProductVariant.hasMany(db.CartItem, { foreignKey: 'variantId' });
    ProductVariant.hasMany(db.OrderItem, { foreignKey: 'variantId' });
  };

  return ProductVariant;
};
