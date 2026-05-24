'use strict';

module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
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
    paymentMethodId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'payment_methods',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending',
    },
    paidAt: {
      type: DataTypes.DATE,
    },
    expiredAt: {
      type: DataTypes.DATE,
    },
    transactionId: {
      type: DataTypes.STRING,
    },
    metadata: {
      type: DataTypes.JSONB,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
    indexes: [
      {
        fields: ['orderId'],
      },
      {
        fields: ['paymentMethodId'],
      },
    ],
  });

  Payment.associate = (db) => {
    Payment.belongsTo(db.Order, { foreignKey: 'orderId' });
    Payment.belongsTo(db.PaymentMethod, { foreignKey: 'paymentMethodId' });
  };

  return Payment;
};
