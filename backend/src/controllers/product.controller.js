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

const getBySlugOrId = catchAsync(async (req, res) => {
  const { slugOrId } = req.params;
  let product = null;
  
  // Check if it looks like a UUID (contains hyphens and is 36 chars)
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  
  if (isUUID) {
    // Try ID first if it's a UUID
    try {
      product = await productService.getById(slugOrId);
    } catch (err) {
      // Fallback to slug
      product = await productService.getBySlug(slugOrId);
    }
  } else {
    // Try slug first if it's not a UUID
    try {
      product = await productService.getBySlug(slugOrId);
    } catch (err) {
      // Fallback to ID
      product = await productService.getById(slugOrId);
    }
  }
  
  ApiResponse.success(res, product, 'Product retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const data = await productService.create(req.body, req.user.userId);
  ApiResponse.created(res, data, 'Product created successfully');
});

const update = catchAsync(async (req, res) => {
  const data = await productService.update(req.params.id, req.body);
  ApiResponse.success(res, data, 'Product updated successfully');
});

const remove = catchAsync(async (req, res) => {
  await productService.remove(req.params.id);
  ApiResponse.success(res, null, 'Product deleted successfully');
});

module.exports = {
  getAll,
  getFeatured,
  getBySlug,
  getBySlugOrId,
  create,
  update,
  remove,
};
