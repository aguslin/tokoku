const { Role } = require('../models');
const ApiError = require('../utils/ApiError');

const findByName = async (name) => {
  try {
    return await Role.findOne({ where: { name } });
  } catch (error) {
    throw ApiError.internal('Error finding role by name');
  }
};

const findAll = async () => {
  try {
    return await Role.findAll({ order: [['name', 'ASC']] });
  } catch (error) {
    throw ApiError.internal('Error finding roles');
  }
};

const create = async (data) => {
  try {
    return await Role.create(data);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw ApiError.conflict('Role with this name already exists');
    }
    throw ApiError.internal('Error creating role');
  }
};

const update = async (id, data) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      throw ApiError.notFound('Role not found');
    }
    await role.update(data);
    return role;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating role');
  }
};

const deleteById = async (id) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) {
      throw ApiError.notFound('Role not found');
    }
    await role.destroy();
    return role;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting role');
  }
};

module.exports = {
  findByName,
  findAll,
  create,
  update,
  delete: deleteById,
};
