const db = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { Product, Category, ProductImage, ProductVariant, User, Review } = db;

const productIncludes = [
  { model: Category, as: 'Category', attributes: ['id', 'name', 'slug'] },
  {
    model: ProductImage,
    as: 'ProductImages',
    attributes: ['id', 'url', 'alt', 'isPrimary', 'sortOrder'],
    order: [['sortOrder', 'ASC']],
  },
  {
    model: ProductVariant,
    as: 'ProductVariants',
    attributes: ['id', 'name', 'sku', 'price', 'stock', 'isActive'],
    where: { isActive: true },
    required: false,
  },
  {
    model: User,
    as: 'seller',
    attributes: ['id', 'name', 'avatar'],
  },
];

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { search, categoryId, minPrice, maxPrice, isActive, isFeatured, sortBy, sortOrder, sellerId } = query;

  const where = {};
  if (search) {
    where[db.Sequelize.Op.or] = [
      { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { description: { [db.Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[db.Sequelize.Op.gte] = parseFloat(minPrice);
    if (maxPrice) where.price[db.Sequelize.Op.lte] = parseFloat(maxPrice);
  }
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured === 'true';
  }
  if (sellerId) {
    where.sellerId = sellerId;
  }

  let order = [['createdAt', 'DESC']];
  if (sortBy) {
    const allowedSort = ['name', 'price', 'createdAt', 'updatedAt'];
    if (allowedSort.includes(sortBy)) {
      order = [[sortBy, sortOrder === 'asc' ? 'ASC' : 'DESC']];
    }
  }

  const { count, rows } = await Product.findAndCountAll({
    where,
    include: productIncludes,
    offset,
    limit,
    order,
    distinct: true,
  });

  return { products: rows, meta: getPaginationMeta(count, page, limit) };
};

const getBySlug = async (slug) => {
  const product = await Product.findOne({
    where: { slug },
    include: productIncludes,
  });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product;
};

const getById = async (id) => {
  const product = await Product.findByPk(id, {
    include: productIncludes,
  });
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product;
};

const create = async (data, sellerId) => {
  // Generate slug from name if not provided
  if (!data.slug && data.name) {
    let slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
    
    // Check if slug already exists and make it unique if needed
    let uniqueSlug = slug;
    let counter = 1;
    let existing = await Product.findOne({ where: { slug: uniqueSlug } });
    while (existing) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
      existing = await Product.findOne({ where: { slug: uniqueSlug } });
    }
    data.slug = uniqueSlug;
  }

  if (data.slug) {
    const existing = await Product.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw ApiError.conflict('Product slug already exists');
    }
  }

  if (data.categoryId) {
    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
  }

  const product = await Product.create({ ...data, sellerId });

  if (data.images && Array.isArray(data.images)) {
    await ProductImage.bulkCreate(
      data.images.map((img, idx) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt || data.name,
        isPrimary: img.isPrimary || idx === 0,
        sortOrder: img.sortOrder || idx,
      })),
    );
  }

  if (data.variants && Array.isArray(data.variants)) {
    await ProductVariant.bulkCreate(
      data.variants.map((v) => ({ ...v, productId: product.id })),
    );
  }

  return getById(product.id);
};

const update = async (id, data) => {
  const product = await Product.findByPk(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (data.slug && data.slug !== product.slug) {
    const existing = await Product.findOne({ where: { slug: data.slug } });
    if (existing) {
      throw ApiError.conflict('Product slug already exists');
    }
  }

  if (data.categoryId) {
    const category = await Category.findByPk(data.categoryId);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
  }

  if (data.stock !== undefined) {
    logger.info(`[PRODUCT UPDATE] Product ${id} (${product.name}): stock ${product.stock} -> ${data.stock} (direct set)`);
  }
  if (data.sold !== undefined) {
    logger.info(`[PRODUCT UPDATE] Product ${id} (${product.name}): sold ${product.sold} -> ${data.sold} (direct set)`);
  }

  await product.update(data);

  if (data.images && Array.isArray(data.images)) {
    await ProductImage.destroy({ where: { productId: id } });
    await ProductImage.bulkCreate(
      data.images.map((img, idx) => ({
        productId: id,
        url: img.url,
        alt: img.alt || product.name,
        isPrimary: img.isPrimary || idx === 0,
        sortOrder: img.sortOrder || idx,
      })),
    );
  }

  return getById(id);
};

const remove = async (id) => {
  const product = await Product.findByPk(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await product.destroy();
  return { message: 'Product deleted successfully' };
};

const getFeatured = async (limit = 8) => {
  const products = await Product.findAll({
    where: { isFeatured: true, isActive: true },
    include: productIncludes,
    limit: Math.min(parseInt(limit, 10) || 8, 50),
    order: [['createdAt', 'DESC']],
  });
  return products;
};

module.exports = {
  getAll,
  getBySlug,
  getById,
  create,
  update,
  remove,
  getFeatured,
};
