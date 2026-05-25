const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const orderService = require('../services/order.service');

const createOrder = catchAsync(async (req, res) => {
  const data = await orderService.createOrder(req.user.userId, req.body);
  ApiResponse.created(res, data, 'Order created successfully');
});

const getUserOrders = catchAsync(async (req, res) => {
  const data = await orderService.getUserOrders(req.user.userId, req.query);
  ApiResponse.success(res, data, 'Orders retrieved successfully');
});

const getAllOrders = catchAsync(async (req, res) => {
  const data = await orderService.getAllOrders(req.query);
  ApiResponse.success(res, data, 'All orders retrieved successfully');
});

const getOrderById = catchAsync(async (req, res) => {
  const data = await orderService.getOrderById(req.params.id, req.user.userId);
  ApiResponse.success(res, data, 'Order retrieved successfully');
});

const updateStatus = catchAsync(async (req, res) => {
  const data = await orderService.updateStatus(req.params.id, req.body.status);
  ApiResponse.success(res, data, 'Order status updated successfully');
});

const cancelOrder = catchAsync(async (req, res) => {
  const data = await orderService.cancelOrder(req.params.id, req.user.userId, req.body);
  ApiResponse.success(res, data, 'Order cancelled successfully');
});

const confirmReceipt = catchAsync(async (req, res) => {
  const data = await orderService.confirmReceipt(req.params.id, req.user.userId);
  ApiResponse.success(res, data, 'Receipt confirmed successfully');
});

module.exports = {
  createOrder,
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateStatus,
  cancelOrder,
  confirmReceipt,
};
