'use strict';

module.exports = (sequelize, DataTypes) => {
  const Voucher = sequelize.define('Voucher', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    value: {
      type: DataTypes.DECIMAL(15, 2),
    },
    minOrder: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(15, 2),
    },
    usageLimit: {
      type: DataTypes.INTEGER,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    startsAt: {
      type: DataTypes.DATE,
    },
    endsAt: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'vouchers',
    paranoid: true,
    timestamps: true,
  });

  Voucher.associate = (db) => {
    Voucher.hasMany(db.VoucherUsage, { foreignKey: 'voucherId' });
  };

  return Voucher;
};
