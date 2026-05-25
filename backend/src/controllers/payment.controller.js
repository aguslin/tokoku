const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const paymentService = require('../services/payment.service');

const createPayment = catchAsync(async (req, res) => {
  const { paymentMethodId } = req.body;
  const data = await paymentService.createPayment(req.params.orderId, paymentMethodId);
  ApiResponse.created(res, data, 'Payment created successfully');
});

const getPaymentByOrder = catchAsync(async (req, res) => {
  const data = await paymentService.getPaymentByOrder(req.params.orderId);
  ApiResponse.success(res, data, 'Payment retrieved successfully');
});

const submitPaymentProof = catchAsync(async (req, res) => {
  const proofUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.proofUrl;
  const data = await paymentService.submitPaymentProof(req.params.orderId, req.user.id, proofUrl);
  ApiResponse.success(res, data, 'Payment proof submitted successfully');
});

module.exports = {
  createPayment,
  getPaymentByOrder,
  submitPaymentProof,
};
