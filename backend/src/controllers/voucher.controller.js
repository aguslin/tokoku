const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const voucherService = require('../services/voucher.service');

const validateVoucher = catchAsync(async (req, res) => {
  const data = await voucherService.validateVoucher(req.body.code, req.user.id, req.body);
  ApiResponse.success(res, data, 'Voucher validated successfully');
});

const getAll = catchAsync(async (req, res) => {
  const data = await voucherService.getAll(req.query);
  ApiResponse.success(res, data, 'Vouchers retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const data = await voucherService.create(req.body);
  ApiResponse.created(res, data, 'Voucher created successfully');
});

const update = catchAsync(async (req, res) => {
  const data = await voucherService.update(req.params.id, req.body);
  ApiResponse.success(res, data, 'Voucher updated successfully');
});

const remove = catchAsync(async (req, res) => {
  await voucherService.remove(req.params.id);
  ApiResponse.success(res, null, 'Voucher deleted successfully');
});

module.exports = {
  validateVoucher,
  getAll,
  create,
  update,
  remove,
};
