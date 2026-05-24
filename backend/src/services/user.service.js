const bcrypt = require('bcryptjs');
const db = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { User, UserRole, Role } = db;

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: UserRole,
        include: [{ model: Role, as: 'Role', attributes: ['name'] }],
      },
    ],
  });
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const allowedFields = ['name', 'phone', 'avatar'];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updates[field] = data[field];
    }
  }

  await user.update(updates);

  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });
  return updatedUser;
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await user.update({ password: hashedPassword });

  return { message: 'Password changed successfully' };
};

const getAllUsers = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search, isActive, role } = query;

  const where = {};
  if (search) {
    where[db.Sequelize.Op.or] = [
      { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { email: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const include = [
    {
      model: UserRole,
      include: [{ model: Role, as: 'Role', attributes: ['name'] }],
    },
  ];

  if (role) {
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (roleRecord) {
      include[0].where = { roleId: roleRecord.id };
    }
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include,
    attributes: { exclude: ['password'] },
    offset,
    limit,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return { users: rows, meta: getPaginationMeta(count, page, limit) };
};

const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await user.destroy();
  return { message: 'User deleted successfully' };
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
};
