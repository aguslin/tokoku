'use strict';

module.exports = (sequelize, DataTypes) => {
  const VoucherUsage = sequelize.define('VoucherUsage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    voucherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'vouchers',
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
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    usedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'voucher_usages',
    timestamps: true,
    indexes: [
      {
        fields: ['voucherId'],
      },
      {
        fields: ['userId'],
      },
      {
        fields: ['orderId'],
      },
    ],
  });

  VoucherUsage.associate = (db) => {
    VoucherUsage.belongsTo(db.Voucher, { foreignKey: 'voucherId' });
    VoucherUsage.belongsTo(db.User, { foreignKey: 'userId' });
    VoucherUsage.belongsTo(db.Order, { foreignKey: 'orderId' });
  };

  return VoucherUsage;
};
