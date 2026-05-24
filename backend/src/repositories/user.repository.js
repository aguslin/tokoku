const db = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');
const { Op } = require('sequelize');

const findByEmail = async (email) => {
  try {
    return await User.findOne({ where: { email } });
  } catch (error) {
    throw ApiError.internal('Error finding user by email');
  }
};

const findById = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding user by id');
  }
};

const create = async (data) => {
  try {
    return await User.create(data);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw ApiError.conflict('User with this email already exists');
    }
    throw ApiError.internal('Error creating user');
  }
};

const update = async (id, data) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await user.update(data);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating user');
  }
};

const findAll = async (query = {}) => {
  try {
    const { page, limit, offset } = getPagination(query);
    const where = {};

    if (query.name) {
      where.name = { [Op.iLike]: `%${query.name}%` };
    }
    if (query.email) {
      where.email = { [Op.iLike]: `%${query.email}%` };
    }
    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true' || query.isActive === true;
    }
    if (query.role) {
      const role = await db.Role.findOne({ where: { name: query.role } });
      if (role) {
        const roleUserIds = await db.UserRole.findAll({
          where: { roleId: role.id },
          attributes: ['userId'],
        });
        where.id = roleUserIds.map((r) => r.userId);
      }
    }

    const { count: total, rows: users } = await db.User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: users,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding users');
  }
};

const softDelete = async (id) => {
  try {
    const user = await User.findByPk(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    await user.destroy();
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting user');
  }
};

module.exports = {
  findByEmail,
  findById,
  create,
  update,
  findAll,
  softDelete,
};
