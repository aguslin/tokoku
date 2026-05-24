'use strict';

module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  }, {
    tableName: 'carts',
    timestamps: true,
  });

  Cart.associate = (db) => {
    Cart.belongsTo(db.User, { foreignKey: 'userId' });
    Cart.hasMany(db.CartItem, { foreignKey: 'cartId' });
  };

  return Cart;
};
