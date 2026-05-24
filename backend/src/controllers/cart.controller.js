const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const cartService = require('../services/cart.service');

const getCart = catchAsync(async (req, res) => {
  const data = await cartService.getCart(req.user.id);
  ApiResponse.success(res, data, 'Cart retrieved successfully');
});

const addItem = catchAsync(async (req, res) => {
  const data = await cartService.addItem(req.user.id, req.body);
  ApiResponse.success(res, data, 'Item added to cart successfully');
});

const updateItem = catchAsync(async (req, res) => {
  const data = await cartService.updateItem(req.user.id, req.params.itemId, req.body);
  ApiResponse.success(res, data, 'Cart item updated successfully');
});

const removeItem = catchAsync(async (req, res) => {
  await cartService.removeItem(req.user.id, req.params.itemId);
  ApiResponse.success(res, null, 'Item removed from cart successfully');
});

const clearCart = catchAsync(async (req, res) => {
  await cartService.clearCart(req.user.id);
  ApiResponse.success(res, null, 'Cart cleared successfully');
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
};
