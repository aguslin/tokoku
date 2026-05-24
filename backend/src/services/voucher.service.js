const db = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { Voucher, VoucherUsage } = db;

const validateVoucher = async (code, userId, orderTotal) => {
  const voucher = await Voucher.findOne({ where: { code, isActive: true } });
  if (!voucher) {
    throw ApiError.notFound('Voucher not found or inactive');
  }

  const now = new Date();
  if (voucher.startsAt && new Date(voucher.startsAt) > now) {
    throw ApiError.badRequest('Voucher is not yet active');
  }
  if (voucher.endsAt && new Date(voucher.endsAt) < now) {
    throw ApiError.badRequest('Voucher has expired');
  }

  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    throw ApiError.badRequest('Voucher usage limit has been reached');
  }

  if (orderTotal < parseFloat(voucher.minOrder || 0)) {
    throw ApiError.badRequest(`Minimum order amount of ${voucher.minOrder} is required`);
  }

  const usageCount = await VoucherUsage.count({
    where: { voucherId: voucher.id, userId },
  });
  if (usageCount > 0) {
    throw ApiError.badRequest('Voucher has already been used');
  }

  return voucher;
};

const applyVoucher = async (code, userId, orderTotal) => {
  const voucher = await validateVoucher(code, userId, orderTotal);

  let discount = 0;
  if (voucher.type === 'percentage') {
    discount = (orderTotal * parseFloat(voucher.value)) / 100;
    if (voucher.maxDiscount) {
      discount = Math.min(discount, parseFloat(voucher.maxDiscount));
    }
  } else {
    discount = parseFloat(voucher.value);
  }

  discount = Math.min(discount, orderTotal);

  return { voucher, discount };
};

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const { isActive, type } = query;

  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }
  if (type) {
    where.type = type;
  }

  const { count, rows } = await Voucher.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { vouchers: rows, meta: getPaginationMeta(count, page, limit) };
};

const create = async (data) => {
  const existing = await Voucher.findOne({ where: { code: data.code } });
  if (existing) {
    throw ApiError.conflict('Voucher code already exists');
  }

  const voucher = await Voucher.create(data);
  return voucher;
};

const update = async (id, data) => {
  const voucher = await Voucher.findByPk(id);
  if (!voucher) {
    throw ApiError.notFound('Voucher not found');
  }

  if (data.code && data.code !== voucher.code) {
    const existing = await Voucher.findOne({ where: { code: data.code } });
    if (existing) {
      throw ApiError.conflict('Voucher code already exists');
    }
  }

  await voucher.update(data);
  return voucher;
};

const del = async (id) => {
  const voucher = await Voucher.findByPk(id);
  if (!voucher) {
    throw ApiError.notFound('Voucher not found');
  }

  await voucher.destroy();
  return { message: 'Voucher deleted successfully' };
};

module.exports = {
  validateVoucher,
  applyVoucher,
  getAll,
  create,
  update,
  delete: del,
};
