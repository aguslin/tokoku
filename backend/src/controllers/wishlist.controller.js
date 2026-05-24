const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const wishlistService = require('../services/wishlist.service');

const getWishlist = catchAsync(async (req, res) => {
  const data = await wishlistService.getWishlist(req.user.id);
  ApiResponse.success(res, data, 'Wishlist retrieved successfully');
});

const addToWishlist = catchAsync(async (req, res) => {
  const data = await wishlistService.addToWishlist(req.user.id, req.body);
  ApiResponse.created(res, data, 'Item added to wishlist successfully');
});

const removeFromWishlist = catchAsync(async (req, res) => {
  await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
  ApiResponse.success(res, null, 'Item removed from wishlist successfully');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
