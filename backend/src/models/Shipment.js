'use strict';

module.exports = (sequelize, DataTypes) => {
  const Shipment = sequelize.define('Shipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    courierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'couriers',
        key: 'id',
      },
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    trackingNumber: {
      type: DataTypes.STRING,
    },
    service: {
      type: DataTypes.STRING,
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
    },
    status: {
      type: DataTypes.STRING,
    },
    shippedAt: {
      type: DataTypes.DATE,
    },
    deliveredAt: {
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'shipments',
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['courierId'],
      },
      {
        fields: ['addressId'],
      },
    ],
  });

  Shipment.associate = (db) => {
    Shipment.belongsTo(db.Order, { foreignKey: 'orderId' });
    Shipment.belongsTo(db.Courier, { foreignKey: 'courierId' });
    Shipment.belongsTo(db.Address, { foreignKey: 'addressId' });
  };

  return Shipment;
};
