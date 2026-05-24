const { Wishlist, Product } = require('../models');
const ApiError = require('../utils/ApiError');

const findByUser = async (userId) => {
  try {
    return await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'slug', 'price', 'stock', 'isActive'],
          required: true,
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    throw ApiError.internal('Error finding wishlist');
  }
};

const add = async (userId, productId) => {
  try {
    const existing = await Wishlist.findOne({ where: { userId, productId } });
    if (existing) {
      return existing;
    }
    return await Wishlist.create({ userId, productId });
  } catch (error) {
    throw ApiError.internal('Error adding to wishlist');
  }
};

const remove = async (userId, productId) => {
  try {
    const item = await Wishlist.findOne({ where: { userId, productId } });
    if (!item) {
      throw ApiError.notFound('Wishlist item not found');
    }
    await item.destroy();
    return item;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error removing from wishlist');
  }
};

const isWishlisted = async (userId, productId) => {
  try {
    const count = await Wishlist.count({ where: { userId, productId } });
    return count > 0;
  } catch (error) {
    throw ApiError.internal('Error checking wishlist status');
  }
};

module.exports = {
  findByUser,
  add,
  remove,
  isWishlisted,
};
