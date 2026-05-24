const { Address } = require('../models');
const ApiError = require('../utils/ApiError');

const findByUser = async (userId) => {
  try {
    return await Address.findAll({
      where: { userId },
      order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']],
    });
  } catch (error) {
    throw ApiError.internal('Error finding addresses by user');
  }
};

const findById = async (id) => {
  try {
    const address = await Address.findByPk(id);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    return address;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding address by id');
  }
};

const create = async (data) => {
  try {
    if (data.isPrimary) {
      await Address.update({ isPrimary: false }, { where: { userId: data.userId } });
    }
    return await Address.create(data);
  } catch (error) {
    throw ApiError.internal('Error creating address');
  }
};

const update = async (id, data) => {
  try {
    const address = await Address.findByPk(id);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    if (data.isPrimary && data.userId) {
      await Address.update({ isPrimary: false }, { where: { userId: data.userId } });
    }
    await address.update(data);
    return address;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating address');
  }
};

const deleteById = async (id) => {
  try {
    const address = await Address.findByPk(id);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    await address.destroy();
    return address;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error deleting address');
  }
};

const setPrimary = async (id, userId) => {
  try {
    const address = await Address.findByPk(id);
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    if (address.userId !== userId) {
      throw ApiError.forbidden('Address does not belong to this user');
    }
    await Address.update({ isPrimary: false }, { where: { userId } });
    await address.update({ isPrimary: true });
    return address;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error setting primary address');
  }
};

module.exports = {
  findByUser,
  findById,
  create,
  update,
  delete: deleteById,
  setPrimary,
};
