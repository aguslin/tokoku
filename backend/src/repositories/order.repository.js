const { Order, OrderItem, Payment, Shipment, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');
const { Op } = require('sequelize');

const defaultIncludes = [
  { model: OrderItem, as: 'OrderItems' },
  { model: Payment, as: 'Payments' },
  { model: Shipment, as: 'Shipment' },
];

const findById = async (id) => {
  try {
    const order = await Order.findByPk(id, {
      include: defaultIncludes,
    });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding order by id');
  }
};

const findByUser = async (userId, pagination = {}, filters = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);
    const where = { userId };

    if (filters.status) {
      where.status = filters.status;
    }

    const { count: total, rows: orders } = await Order.findAndCountAll({
      where,
      include: defaultIncludes,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: orders,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding user orders');
  }
};

const findAll = async (pagination = {}, filters = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.startDate) {
      where.createdAt = { ...where.createdAt, [Op.gte]: new Date(filters.startDate) };
    }
    if (filters.endDate) {
      where.createdAt = { ...where.createdAt, [Op.lte]: new Date(filters.endDate) };
    }
    if (filters.orderNumber) {
      where.orderNumber = { [Op.iLike]: `%${filters.orderNumber}%` };
    }
    if (filters.userId) {
      where.userId = filters.userId;
    }

    const { count: total, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        ...defaultIncludes,
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return {
      data: orders,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding orders');
  }
};

const create = async (data) => {
  try {
    return await Order.create(data);
  } catch (error) {
    throw ApiError.internal('Error creating order');
  }
};

const updateStatus = async (id, status) => {
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    await order.update({ status });
    return order;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error updating order status');
  }
};

const findByOrderNumber = async (orderNumber) => {
  try {
    const order = await Order.findOne({
      where: { orderNumber },
      include: defaultIncludes,
    });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error finding order by number');
  }
};

const getSalesStats = async (startDate, endDate) => {
  try {
    const where = {
      status: 'delivered',
    };

    if (startDate) {
      where.createdAt = { ...where.createdAt, [Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, [Op.lte]: new Date(endDate) };
    }

    const orders = await Order.findAll({ where });

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      startDate: startDate || null,
      endDate: endDate || null,
    };
  } catch (error) {
    throw ApiError.internal('Error getting sales stats');
  }
};

module.exports = {
  findById,
  findByUser,
  findAll,
  create,
  updateStatus,
  findByOrderNumber,
  getSalesStats,
};
