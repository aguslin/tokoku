'use strict';

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
    },
    content: {
      type: DataTypes.TEXT,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'reviews',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ['productId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['orderId'],
      },
    ],
  });

  Review.associate = (db) => {
    Review.belongsTo(db.Product, { foreignKey: 'productId' });
    Review.belongsTo(db.User, { foreignKey: 'userId' });
    Review.belongsTo(db.Order, { foreignKey: 'orderId' });
  };

  return Review;
};
