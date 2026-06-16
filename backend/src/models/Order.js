'use strict';

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
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
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
    },
    shippingCost: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    voucherDiscount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
    },
    notes: {
      type: DataTypes.TEXT,
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    deliveredAt: {
      type: DataTypes.DATE,
    },
    cancelledAt: {
      type: DataTypes.DATE,
    },
    cancellationReason: {
      type: DataTypes.TEXT,
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'addresses',
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
    courierService: {
      type: DataTypes.STRING,
    },
    courierServiceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'courier_services',
        key: 'id',
      },
    },
    trackingNumber: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'orders',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['addressId'],
      },
      {
        fields: ['courierId'],
      },
    ],
  });

  Order.associate = (db) => {
    Order.belongsTo(db.User, { foreignKey: 'userId' });
    Order.belongsTo(db.Address, { foreignKey: 'addressId' });
    Order.belongsTo(db.Courier, { foreignKey: 'courierId' });
    Order.belongsTo(db.CourierService, { foreignKey: 'courierServiceId' });
    Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
    Order.hasMany(db.Payment, { foreignKey: 'orderId' });
    Order.hasOne(db.Shipment, { foreignKey: 'orderId' });
    Order.hasMany(db.VoucherUsage, { foreignKey: 'orderId' });
  };

  return Order;
};
