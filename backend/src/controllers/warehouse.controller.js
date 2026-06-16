const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const warehouseService = require('../services/warehouse.service');

const getAll = catchAsync(async (req, res) => {
  const data = await warehouseService.getAll(req.query);
  ApiResponse.success(res, data, 'Warehouses retrieved successfully');
});

const getById = catchAsync(async (req, res) => {
  const data = await warehouseService.getById(req.params.id);
  ApiResponse.success(res, data, 'Warehouse retrieved successfully');
});

const getInventory = catchAsync(async (req, res) => {
  const data = await warehouseService.getInventory(req.params.id);
  ApiResponse.success(res, data, 'Warehouse inventory retrieved successfully');
});

const create = catchAsync(async (req, res) => {
  const data = await warehouseService.create(req.body);
  ApiResponse.created(res, data, 'Warehouse created successfully');
});

const update = catchAsync(async (req, res) => {
  const data = await warehouseService.update(req.params.id, req.body);
  ApiResponse.success(res, data, 'Warehouse updated successfully');
});

const remove = catchAsync(async (req, res) => {
  await warehouseService.remove(req.params.id);
  ApiResponse.success(res, null, 'Warehouse deleted successfully');
});

module.exports = { getAll, getById, getInventory, create, update, remove };
