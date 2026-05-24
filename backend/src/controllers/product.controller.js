const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const productService = require('../services/product.service');

const getAll = catchAsync(async (req, res) => {
  const data = await productService.getAll(req.query);
  ApiResponse.success(res, data, 'Products retrieved successfully');
});

const getFeatured = catchAsync(async (req, res) => {
  const data = await productService.getFeatured(req.query);
  ApiResponse.success(res, data, 'Featured products retrieved successfully');
});

const getBySlug = catchAsync(async (req, res) => {
  const data = await productService.getBySlug(req.params.slug);
  ApiResponse.success(res, data, 'Product retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const data = await productService.create(req.body, req.user);
  ApiResponse.created(res, data, 'Product created successfully');
});

const update = catchAsync(async (req, res) => {
  const data = await productService.update(req.params.id, req.body, req.user);
  ApiResponse.success(res, data, 'Product updated successfully');
});

const remove = catchAsync(async (req, res) => {
  await productService.remove(req.params.id, req.user);
  ApiResponse.success(res, null, 'Product deleted successfully');
});

module.exports = {
  getAll,
  getFeatured,
  getBySlug,
  create,
  update,
  remove,
};
