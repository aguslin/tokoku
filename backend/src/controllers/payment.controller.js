const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');

const createPayment = catchAsync(async (req, res) => {
  const data = await paymentService.createPayment(req.params.orderId, req.body, req.user);
  ApiResponse.created(res, data, 'Payment created successfully');
});

const getPaymentByOrder = catchAsync(async (req, res) => {
  const data = await paymentService.getPaymentByOrder(req.params.orderId, req.user);
  ApiResponse.success(res, data, 'Payment retrieved successfully');
});

module.exports = {
  createPayment,
  getPaymentByOrder,
};
