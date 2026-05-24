'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
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
    description: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'roles',
    timestamps: true,
  });

  Role.associate = (db) => {
    Role.hasMany(db.UserRole, { foreignKey: 'roleId' });
    Role.belongsToMany(db.Permission, {
      through: 'RolePermission',
      foreignKey: 'roleId',
      otherKey: 'permissionId',
    });
  };

  return Role;
};
