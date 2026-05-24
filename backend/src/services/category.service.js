const db = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { Category } = db;

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { isActive, parentId } = query;

  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (parentId !== undefined) {
    where.parentId = parentId === 'null' ? null : parentId;
  }

  const { count, rows } = await Category.findAndCountAll({
    where,
    include: [{ model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] }],
    offset,
    limit,
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });

  return { categories: rows, meta: getPaginationMeta(count, page, limit) };
};

const getBySlug = async (slug) => {
  const category = await Category.findOne({
    where: { slug },
    include: [
      { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
      { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
    ],
  });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
};

const getById = async (id) => {
  const category = await Category.findByPk(id, {
    include: [
      { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
      { model: Category, as: 'children', attributes: ['id', 'name', 'slug'] },
    ],
  });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
};

const create = async (data) => {
  const existing = await Category.findOne({ where: { slug: data.slug } });
  if (existing) {
    throw ApiError.conflict('Category slug already exists');
  }

  if (data.parentId) {
    const parent = await Category.findByPk(data.parentId);
    if (!parent) {
      throw ApiError.notFound('Parent category not found');
    }
  }

  const category = await Category.create(data);
  return category;
};

const update = async (id, data) => {
  const category = await Category.findByPk(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  if (data.slug && data.slug !== category.slug) {
    const existing = await Category.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw ApiError.conflict('Category slug already exists');
    }
  }

  if (data.parentId && data.parentId === id) {
    throw ApiError.badRequest('Category cannot be its own parent');
  }

  if (data.parentId) {
    const parent = await Category.findByPk(data.parentId);
    if (!parent) {
      throw ApiError.notFound('Parent category not found');
    }
  }

  await category.update(data);
  return category;
};

const del = async (id) => {
  const category = await Category.findByPk(id);
  if (!category) {
    throw ApiError.notFound('Category not found');
  }

  const childrenCount = await Category.count({ where: { parentId: id } });
  if (childrenCount > 0) {
    throw ApiError.badRequest('Cannot delete category with subcategories');
  }

  await category.destroy();
  return { message: 'Category deleted successfully' };
};

const getHierarchy = async () => {
  const categories = await Category.findAll({
    where: { parentId: null },
    include: [
      {
        model: Category,
        as: 'children',
        include: [
          {
            model: Category,
            as: 'children',
          },
        ],
      },
    ],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });
  return categories;
};

module.exports = {
  getAll,
  getBySlug,
  getById,
  create,
  update,
  delete: del,
  getHierarchy,
};
