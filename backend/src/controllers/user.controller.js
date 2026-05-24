const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

const getProfile = catchAsync(async (req, res) => {
  const data = await userService.getProfile(req.user.id);
  ApiResponse.success(res, data, 'Profile retrieved successfully');
});

const updateProfile = catchAsync(async (req, res) => {
  const data = await userService.updateProfile(req.user.id, req.body);
  ApiResponse.success(res, data, 'Profile updated successfully');
});

const changePassword = catchAsync(async (req, res) => {
  await userService.changePassword(req.user.id, req.body);
  ApiResponse.success(res, null, 'Password changed successfully');
});

const getAllUsers = catchAsync(async (req, res) => {
  const data = await userService.getAllUsers(req.query);
  ApiResponse.success(res, data, 'Users retrieved successfully');
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUser(req.params.id);
  ApiResponse.success(res, null, 'User deleted successfully');
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
};
