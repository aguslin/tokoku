'use strict';

module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    price: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    comparePrice: {
      type: DataTypes.DECIMAL(15, 2),
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sku: {
      type: DataTypes.STRING,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    sellerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'products',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ['categoryId'],
      },
      {
        fields: ['sellerId'],
      },
    ],
  });

  Product.associate = (db) => {
    Product.belongsTo(db.Category, { foreignKey: 'categoryId' });
    Product.belongsTo(db.User, { as: 'seller', foreignKey: 'sellerId' });
    Product.hasMany(db.ProductImage, { foreignKey: 'productId' });
    Product.hasMany(db.ProductVariant, { foreignKey: 'productId' });
    Product.hasMany(db.Review, { foreignKey: 'productId' });
    Product.hasMany(db.CartItem, { foreignKey: 'productId' });
    Product.hasMany(db.OrderItem, { foreignKey: 'productId' });
    Product.hasMany(db.Wishlist, { foreignKey: 'productId' });
  };

  return Product;
};
