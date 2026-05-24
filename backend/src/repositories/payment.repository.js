const { Payment } = require('../models');
const ApiError = require('../utils/ApiError');

const findById = async (id) => {
  try {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }
    return payment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding payment by id');
  }
};

const findByOrder = async (orderId) => {
  try {
    return await Payment.findAll({
      where: { orderId },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    throw ApiError.internal('Error finding payments by order');
  }
};

const create = async (data) => {
  try {
    return await Payment.create(data);
  } catch (error) {
    throw ApiError.internal('Error creating payment');
  }
};

const update = async (id, data) => {
  try {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      throw ApiError.notFound('Payment not found');
    }
    await payment.update(data);
    return payment;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating payment');
  }
};

module.exports = {
  findById,
  findByOrder,
  create,
  update,
};
