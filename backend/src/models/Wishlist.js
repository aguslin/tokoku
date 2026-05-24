'use strict';

module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
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
  }, {
    tableName: 'wishlists',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'productId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['productId'],
      },
    ],
  });

  Wishlist.associate = (db) => {
    Wishlist.belongsTo(db.User, { foreignKey: 'userId' });
    Wishlist.belongsTo(db.Product, { foreignKey: 'productId' });
  };

  return Wishlist;
};
