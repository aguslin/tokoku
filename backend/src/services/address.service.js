const db = require('../models');
const ApiError = require('../utils/ApiError');

const { Address } = db;

const getUserAddresses = async (userId) => {
  const addresses = await Address.findAll({
    where: { userId },
    order: [['isPrimary', 'DESC'], ['createdAt', 'DESC']],
  });
  return addresses;
};

const createAddress = async (userId, data) => {
  if (data.isPrimary) {
    await Address.update(
      { isPrimary: false },
      { where: { userId } },
    );
  }

  const address = await Address.create({ ...data, userId });
  return address;
};

const updateAddress = async (addressId, userId, data) => {
  const address = await Address.findOne({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw ApiError.notFound('Address not found');
  }

  if (data.isPrimary) {
    await Address.update(
      { isPrimary: false },
      { where: { userId, id: { [db.Sequelize.Op.ne]: addressId } } },
    );
  }

  await address.update(data);
  return address;
};

const deleteAddress = async (addressId, userId) => {
  const address = await Address.findOne({
    where: { id: addressId, userId },
  });
  if (!address) {
    throw ApiError.notFound('Address not found');
  }

  await address.destroy();
  return { message: 'Address deleted successfully' };
};

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
