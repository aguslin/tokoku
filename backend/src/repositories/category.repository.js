const { Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const findAll = async (filters = {}, pagination = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);
    const where = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters.parentId !== undefined) {
      where.parentId = filters.parentId || null;
    }

    const { count: total, rows: categories } = await Category.findAndCountAll({
      where,
      limit,
      offset,
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    return {
      data: categories,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding categories');
  }
};

const findBySlug = async (slug) => {
  try {
    const category = await Category.findOne({ where: { slug } });
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding category by slug');
  }
};

const findById = async (id) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding category by id');
  }
};

const create = async (data) => {
  try {
    return await Category.create(data);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw ApiError.conflict('Category with this slug already exists');
    }
    throw ApiError.internal('Error creating category');
  }
};

const update = async (id, data) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    await category.update(data);
    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating category');
  }
};

const deleteById = async (id) => {
  try {
    const category = await Category.findByPk(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    await category.destroy();
    return category;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting category');
  }
};

const findRoots = async () => {
  try {
    return await Category.findAll({
      where: { parentId: null },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
  } catch (error) {
    throw ApiError.internal('Error finding root categories');
  }
};

const findChildren = async (parentId) => {
  try {
    return await Category.findAll({
      where: { parentId },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });
  } catch (error) {
    throw ApiError.internal('Error finding child categories');
  }
};

module.exports = {
  findAll,
  findBySlug,
  findById,
  create,
  update,
  delete: deleteById,
  findRoots,
  findChildren,
};
