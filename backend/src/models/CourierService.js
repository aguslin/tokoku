'use strict';

module.exports = (sequelize, DataTypes) => {
  const CourierService = sequelize.define('CourierService', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    courierId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'couriers',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 'reguler' or 'instant' — the shipping speed tier (UAT #6)
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Base cost before distance/zone adjustment
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    estimatedDaysMin: {
      type: DataTypes.INTEGER,
    },
    estimatedDaysMax: {
      type: DataTypes.INTEGER,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'courier_services',
    timestamps: true,
    indexes: [
      { fields: ['courierId'] },
    ],
  });

  CourierService.associate = (db) => {
    CourierService.belongsTo(db.Courier, { foreignKey: 'courierId' });
    CourierService.hasMany(db.Order, { foreignKey: 'courierServiceId' });
  };

  return CourierService;
};
