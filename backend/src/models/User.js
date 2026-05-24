'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'users',
    paranoid: true,
    timestamps: true,
  });

  User.associate = (db) => {
    User.hasMany(db.UserRole, { foreignKey: 'userId' });
    User.hasMany(db.Address, { foreignKey: 'userId' });
    User.hasMany(db.Order, { foreignKey: 'userId' });
    User.hasMany(db.Review, { foreignKey: 'userId' });
    User.hasOne(db.Cart, { foreignKey: 'userId' });
    User.hasMany(db.Wishlist, { foreignKey: 'userId' });
    User.hasMany(db.Notification, { foreignKey: 'userId' });
    User.hasMany(db.VoucherUsage, { foreignKey: 'userId' });
  };

  return User;
};
