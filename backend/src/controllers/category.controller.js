const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');

const getAll = catchAsync(async (req, res) => {
  const data = await categoryService.getAll(req.query);
  ApiResponse.success(res, data, 'Categories retrieved successfully');
});

const getBySlug = catchAsync(async (req, res) => {
  const data = await categoryService.getBySlug(req.params.slug);
  ApiResponse.success(res, data, 'Category retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const data = await categoryService.create(req.body);
  ApiResponse.created(res, data, 'Category created successfully');
});

const update = catchAsync(async (req, res) => {
  const data = await categoryService.update(req.params.id, req.body);
  ApiResponse.success(res, data, 'Category updated successfully');
});

const remove = catchAsync(async (req, res) => {
  await categoryService.remove(req.params.id);
  ApiResponse.success(res, null, 'Category deleted successfully');
});

module.exports = {
  getAll,
  getBySlug,
  create,
  update,
  remove,
};
