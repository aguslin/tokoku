const { Voucher } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const findByCode = async (code) => {
  try {
    const voucher = await Voucher.findOne({ where: { code } });
    if (!voucher) {
      throw ApiError.notFound('Voucher not found');
    }
    return voucher;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding voucher by code');
  }
};

const findById = async (id) => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      throw ApiError.notFound('Voucher not found');
    }
    return voucher;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding voucher by id');
  }
};

const findAll = async (pagination = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);

    const { count: total, rows: vouchers } = await Voucher.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: vouchers,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding vouchers');
  }
};

const create = async (data) => {
  try {
    return await Voucher.create(data);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw ApiError.conflict('Voucher with this code already exists');
    }
    throw ApiError.internal('Error creating voucher');
  }
};

const update = async (id, data) => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      throw ApiError.notFound('Voucher not found');
    }
    await voucher.update(data);
    return voucher;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating voucher');
  }
};

const deleteById = async (id) => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      throw ApiError.notFound('Voucher not found');
    }
    await voucher.destroy();
    return voucher;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting voucher');
  }
};

const incrementUsedCount = async (id) => {
  try {
    const voucher = await Voucher.findByPk(id);
    if (!voucher) {
      throw ApiError.notFound('Voucher not found');
    }
    await voucher.increment('usedCount', { by: 1 });
    return voucher.reload();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error incrementing voucher used count');
  }
};

module.exports = {
  findByCode,
  findById,
  findAll,
  create,
  update,
  delete: deleteById,
  incrementUsedCount,
};
