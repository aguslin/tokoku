const db = require('../models');
const ApiError = require('../utils/ApiError');

const { Wishlist, Product, ProductImage } = db;

const wishlistIncludes = [
  {
    model: Product,
    as: 'Product',
    attributes: ['id', 'name', 'slug', 'price', 'comparePrice', 'stock', 'isActive'],
    include: [
      {
        model: ProductImage,
        as: 'ProductImages',
        attributes: ['id', 'url', 'alt', 'isPrimary'],
        where: { isPrimary: true },
        required: false,
      },
    ],
  },
];

const getWishlist = async (userId) => {
  const items = await Wishlist.findAll({
    where: { userId },
    include: wishlistIncludes,
    order: [['createdAt', 'DESC']],
  });
  return items;
};

const addToWishlist = async (userId, productId) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const existing = await Wishlist.findOne({
    where: { userId, productId },
  });
  if (existing) {
    throw ApiError.conflict('Product is already in your wishlist');
  }

  const item = await Wishlist.create({ userId, productId });
  return item;
};

const removeFromWishlist = async (userId, productId) => {
  const item = await Wishlist.findOne({
    where: { userId, productId },
  });
  if (!item) {
    throw ApiError.notFound('Product not found in wishlist');
  }

  await item.destroy();
  return { message: 'Product removed from wishlist' };
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
