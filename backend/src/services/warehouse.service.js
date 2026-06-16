const db = require('../models');
const ApiError = require('../utils/ApiError');
const { resolveCoords } = require('../constants/geo');

const { Warehouse, Inventory, Product, ProductVariant } = db;

const getAll = async (query = {}) => {
  const where = {};
  if (query.isActive !== undefined) {
    where.isActive = query.isActive === 'true' || query.isActive === true;
  }
  const warehouses = await Warehouse.findAll({
    where,
    order: [['name', 'ASC']],
  });
  return warehouses;
};

const getById = async (id) => {
  const warehouse = await Warehouse.findByPk(id);
  if (!warehouse) throw ApiError.notFound('Warehouse not found');
  return warehouse;
};

// Auto-fill latitude/longitude from the city/province if the admin didn't provide them,
// so the nearest-warehouse engine always has coordinates to work with.
const withCoords = (data) => {
  const out = { ...data };
  if ((out.latitude == null || out.longitude == null) && (out.city || out.province)) {
    const coords = resolveCoords(out.city, out.province);
    if (coords) {
      if (out.latitude == null) out.latitude = coords.lat;
      if (out.longitude == null) out.longitude = coords.lng;
    }
  }
  return out;
};

const create = async (data) => {
  if (!data.code) throw ApiError.badRequest('Warehouse code is required');
  const existing = await Warehouse.findOne({ where: { code: data.code } });
  if (existing) throw ApiError.conflict('Warehouse code already exists');
  return Warehouse.create(withCoords(data));
};

const update = async (id, data) => {
  const warehouse = await Warehouse.findByPk(id);
  if (!warehouse) throw ApiError.notFound('Warehouse not found');
  if (data.code && data.code !== warehouse.code) {
    const existing = await Warehouse.findOne({ where: { code: data.code } });
    if (existing) throw ApiError.conflict('Warehouse code already exists');
  }
  await warehouse.update(withCoords({ ...warehouse.toJSON(), ...data }));
  return warehouse;
};

const remove = async (id) => {
  const warehouse = await Warehouse.findByPk(id);
  if (!warehouse) throw ApiError.notFound('Warehouse not found');
  await Inventory.destroy({ where: { warehouseId: id } });
  await warehouse.destroy();
  return { message: 'Warehouse deleted successfully' };
};

const getInventory = async (warehouseId) => {
  await getById(warehouseId);
  return Inventory.findAll({
    where: { warehouseId },
    include: [
      { model: Product, as: 'Product', attributes: ['id', 'name', 'sku'] },
      { model: ProductVariant, as: 'ProductVariant', attributes: ['id', 'name'] },
    ],
    order: [['createdAt', 'ASC']],
  });
};

module.exports = { getAll, getById, create, update, remove, getInventory };
