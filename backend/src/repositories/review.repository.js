const { Review } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');
const { Op } = require('sequelize');

const findByProduct = async (productId, pagination = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);

    const { count: total, rows: reviews } = await Review.findAndCountAll({
      where: { productId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: reviews,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding reviews by product');
  }
};

const findByUser = async (userId, pagination = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);

    const { count: total, rows: reviews } = await Review.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: reviews,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding reviews by user');
  }
};

const create = async (data) => {
  try {
    return await Review.create(data);
  } catch (error) {
    throw ApiError.internal('Error creating review');
  }
};

const update = async (id, data) => {
  try {
    const review = await Review.findByPk(id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }
    await review.update(data);
    return review;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating review');
  }
};

const deleteById = async (id) => {
  try {
    const review = await Review.findByPk(id);
    if (!review) {
      throw ApiError.notFound('Review not found');
    }
    await review.destroy();
    return review;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting review');
  }
};

const getProductRating = async (productId) => {
  try {
    const result = await Review.findAll({
      where: { productId },
      attributes: [
        [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'averageRating'],
        [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'totalReviews'],
      ],
      raw: true,
    });

    return {
      averageRating: parseFloat(result[0].averageRating) || 0,
      totalReviews: parseInt(result[0].totalReviews, 10) || 0,
    };
  } catch (error) {
    throw ApiError.internal('Error getting product rating');
  }
};

module.exports = {
  findByProduct,
  findByUser,
  create,
  update,
  delete: deleteById,
  getProductRating,
};
