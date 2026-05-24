const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const register = catchAsync(async (req, res) => {
  const data = await authService.register(req.body);
  ApiResponse.created(res, data, 'Registration successful');
});

const login = catchAsync(async (req, res) => {
  const data = await authService.login(req.body);
  ApiResponse.success(res, data, 'Login successful');
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  ApiResponse.success(res, null, 'Logout successful');
});

const refreshToken = catchAsync(async (req, res) => {
  const data = await authService.refreshToken(req.body.refreshToken);
  ApiResponse.success(res, data, 'Token refreshed successfully');
});

const getProfile = catchAsync(async (req, res) => {
  const data = await authService.getProfile(req.user.id);
  ApiResponse.success(res, data, 'Profile retrieved successfully');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
};
