const { Product, Category } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');
const { Op } = require('sequelize');

const findAll = async (filters = {}, pagination = {}, includes = []) => {
  try {
    const { page, limit, offset } = getPagination(pagination);
    const where = {};

    if (filters.search) {
      where.name = { [Op.iLike]: `%${filters.search}%` };
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.categorySlug) {
      const category = await Category.findOne({ where: { slug: filters.categorySlug } });
      if (category) {
        where.categoryId = category.id;
      } else {
        return { data: [], meta: getPaginationMeta(0, page, limit) };
      }
    }
    if (filters.minPrice !== undefined) {
      where.price = { ...where.price, [Op.gte]: parseFloat(filters.minPrice) };
    }
    if (filters.maxPrice !== undefined) {
      where.price = { ...where.price, [Op.lte]: parseFloat(filters.maxPrice) };
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive === 'true' || filters.isActive === true;
    }
    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured === 'true' || filters.isFeatured === true;
    }
    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    let order = [['createdAt', 'DESC']];
    if (filters.sortBy) {
      const sortOrders = {
        price_asc: [['price', 'ASC']],
        price_desc: [['price', 'DESC']],
        name_asc: [['name', 'ASC']],
        name_desc: [['name', 'DESC']],
        newest: [['createdAt', 'DESC']],
        oldest: [['createdAt', 'ASC']],
      };
      order = sortOrders[filters.sortBy] || order;
    }

    const include = [
      { model: Category, attributes: ['id', 'name', 'slug'], required: false },
      ...includes,
    ];

    const { count: total, rows: products } = await Product.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
      distinct: true,
    });

    return {
      data: products,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding products');
  }
};

const findBySlug = async (slug) => {
  try {
    const product = await Product.findOne({ where: { slug } });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding product by slug');
  }
};

const findById = async (id) => {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding product by id');
  }
};

const create = async (data) => {
  try {
    return await Product.create(data);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw ApiError.conflict('Product with this slug already exists');
    }
    throw ApiError.internal('Error creating product');
  }
};

const update = async (id, data) => {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    await product.update(data);
    return product;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating product');
  }
};

const deleteById = async (id) => {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    await product.destroy();
    return product;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting product');
  }
};

const updateStock = async (id, quantity) => {
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw ApiError.unprocessable('Insufficient stock');
    }
    await product.update({ stock: newStock });
    return product;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating product stock');
  }
};

const findFeatured = async (limit = 10) => {
  try {
    return await Product.findAll({
      where: { isFeatured: true, isActive: true },
      limit,
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    throw ApiError.internal('Error finding featured products');
  }
};

module.exports = {
  findAll,
  findBySlug,
  findById,
  create,
  update,
  delete: deleteById,
  updateStock,
  findFeatured,
};
