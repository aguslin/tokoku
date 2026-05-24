'use strict';

module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
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
    label: {
      type: DataTypes.STRING,
    },
    recipientName: {
      type: DataTypes.STRING,
    },
    recipientPhone: {
      type: DataTypes.STRING,
    },
    street: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    district: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postalCode: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'addresses',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
    ],
  });

  Address.associate = (db) => {
    Address.belongsTo(db.User, { foreignKey: 'userId' });
    Address.hasMany(db.Order, { foreignKey: 'addressId' });
    Address.hasMany(db.Shipment, { foreignKey: 'addressId' });
  };

  return Address;
};
