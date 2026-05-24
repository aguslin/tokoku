const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const addressService = require('../services/address.service');

const getUserAddresses = catchAsync(async (req, res) => {
  const data = await addressService.getUserAddresses(req.user.id);
  ApiResponse.success(res, data, 'Addresses retrieved successfully');
});

const createAddress = catchAsync(async (req, res) => {
  const data = await addressService.createAddress(req.user.id, req.body);
  ApiResponse.created(res, data, 'Address created successfully');
});

const updateAddress = catchAsync(async (req, res) => {
  const data = await addressService.updateAddress(req.params.id, req.user.id, req.body);
  ApiResponse.success(res, data, 'Address updated successfully');
});

const deleteAddress = catchAsync(async (req, res) => {
  await addressService.deleteAddress(req.params.id, req.user.id);
  ApiResponse.success(res, null, 'Address deleted successfully');
});

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
