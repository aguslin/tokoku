'use strict';

module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define('ProductImage', {
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
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    alt: {
      type: DataTypes.STRING,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'product_images',
    timestamps: true,
    indexes: [
      {
        fields: ['productId'],
      },
    ],
  });

  ProductImage.associate = (db) => {
    ProductImage.belongsTo(db.Product, { foreignKey: 'productId' });
  };

  return ProductImage;
};
