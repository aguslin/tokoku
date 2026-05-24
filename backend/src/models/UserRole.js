'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserRole = sequelize.define('UserRole', {
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
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
  }, {
    tableName: 'user_roles',
    timestamps: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['roleId'],
      },
    ],
  });

  UserRole.associate = (db) => {
    UserRole.belongsTo(db.User, { foreignKey: 'userId' });
    UserRole.belongsTo(db.Role, { foreignKey: 'roleId' });
  };

  return UserRole;
};
