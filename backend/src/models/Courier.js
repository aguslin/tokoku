'use strict';

module.exports = (sequelize, DataTypes) => {
  const Courier = sequelize.define('Courier', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'couriers',
    timestamps: true,
  });

  Courier.associate = (db) => {
    Courier.hasMany(db.Order, { foreignKey: 'courierId' });
    Courier.hasMany(db.Shipment, { foreignKey: 'courierId' });
  };

  return Courier;
};
