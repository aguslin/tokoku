'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    image: {
      type: DataTypes.STRING,
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'categories',
    paranoid: true,
    timestamps: true,
    indexes: [
      {
        fields: ['parentId'],
      },
    ],
  });

  Category.associate = (db) => {
    Category.belongsTo(db.Category, { as: 'parent', foreignKey: 'parentId' });
    Category.hasMany(db.Category, { as: 'children', foreignKey: 'parentId' });
    Category.hasMany(db.Product, { foreignKey: 'categoryId' });
  };

  return Category;
};
