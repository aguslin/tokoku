'use strict';

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'permissions',
    timestamps: true,
  });

  Permission.associate = (db) => {
    Permission.belongsToMany(db.Role, {
      through: 'RolePermission',
      foreignKey: 'permissionId',
      otherKey: 'roleId',
    });
  };

  return Permission;
};
