const db = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { Review, Product, Order, OrderItem, User } = db;

const createReview = async (userId, { productId, orderId, rating, title, content }) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (orderId) {
    const order = await Order.findOne({
      where: { id: orderId, userId },
    });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    if (order.status !== 'delivered') {
      throw ApiError.badRequest('Can only review products from delivered orders');
    }

    const orderItem = await OrderItem.findOne({
      where: { orderId, productId },
    });
    if (!orderItem) {
      throw ApiError.badRequest('Product not found in this order');
    }
  }

  const existingReview = await Review.findOne({
    where: { userId, productId, orderId: orderId || null },
  });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  const validatedRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

  const review = await Review.create({
    userId,
    productId,
    orderId: orderId || null,
    rating: validatedRating,
    title: title || null,
    content: content || null,
  });

  return review;
};

const getProductReviews = async (productId, query) => {
  const product = await Product.findByPk(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const { page, limit, offset } = getPagination(query);
  const { rating, sortBy } = query;

  const where = { productId };
  if (rating) {
    where.rating = parseInt(rating, 10);
  }

  let order = [['createdAt', 'DESC']];
  if (sortBy === 'rating_asc') {
    order = [['rating', 'ASC']];
  } else if (sortBy === 'rating_desc') {
    order = [['rating', 'DESC']];
  }

  const { count, rows } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, as: 'User', attributes: ['id', 'name', 'avatar'] },
    ],
    offset,
    limit,
    order,
  });

  return { reviews: rows, meta: getPaginationMeta(count, page, limit) };
};

const getUserReviews = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);

  const { count, rows } = await Review.findAndCountAll({
    where: { userId },
    include: [
      { model: Product, as: 'Product', attributes: ['id', 'name', 'slug', 'image'] },
    ],
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { reviews: rows, meta: getPaginationMeta(count, page, limit) };
};

const deleteReview = async (reviewId, userId) => {
  const review = await Review.findOne({
    where: { id: reviewId, userId },
  });
  if (!review) {
    throw ApiError.notFound('Review not found or not owned by you');
  }

  await review.destroy();
  return { message: 'Review deleted successfully' };
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
};
