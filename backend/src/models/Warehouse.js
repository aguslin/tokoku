'use strict';

module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define('Warehouse', {
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
    address: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'warehouses',
    timestamps: true,
  });

  Warehouse.associate = (db) => {
    Warehouse.hasMany(db.Inventory, { foreignKey: 'warehouseId' });
    Warehouse.hasMany(db.Shipment, { foreignKey: 'warehouseId' });
  };

  return Warehouse;
};
