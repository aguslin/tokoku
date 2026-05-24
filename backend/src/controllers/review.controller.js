const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const reviewService = require('../services/review.service');

const createReview = catchAsync(async (req, res) => {
  const data = await reviewService.createReview(req.user.id, req.body);
  ApiResponse.created(res, data, 'Review created successfully');
});

const getProductReviews = catchAsync(async (req, res) => {
  const data = await reviewService.getProductReviews(req.params.productId, req.query);
  ApiResponse.success(res, data, 'Reviews retrieved successfully');
});

const getUserReviews = catchAsync(async (req, res) => {
  const data = await reviewService.getUserReviews(req.user.id, req.query);
  ApiResponse.success(res, data, 'Your reviews retrieved successfully');
});

const deleteReview = catchAsync(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user.id);
  ApiResponse.success(res, null, 'Review deleted successfully');
});

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  deleteReview,
};
