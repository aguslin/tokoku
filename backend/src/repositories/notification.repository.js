const { Notification } = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const findByUser = async (userId, pagination = {}) => {
  try {
    const { page, limit, offset } = getPagination(pagination);

    const { count: total, rows: notifications } = await Notification.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      data: notifications,
      meta: getPaginationMeta(total, page, limit),
    };
  } catch (error) {
    throw ApiError.internal('Error finding notifications');
  }
};

const create = async (data) => {
  try {
    return await Notification.create(data);
  } catch (error) {
    throw ApiError.internal('Error creating notification');
  }
};

const markAsRead = async (id) => {
  try {
    const notification = await Notification.findByPk(id);
    if (!notification) {
      throw ApiError.notFound('Notification not found');
    }
    await notification.update({ isRead: true });
    return notification;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal('Error marking notification as read');
  }
};

const markAllAsRead = async (userId) => {
  try {
    const [updatedCount] = await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } },
    );
    return { updatedCount };
  } catch (error) {
    throw ApiError.internal('Error marking all notifications as read');
  }
};

const countUnread = async (userId) => {
  try {
    const count = await Notification.count({ where: { userId, isRead: false } });
    return { count };
  } catch (error) {
    throw ApiError.internal('Error counting unread notifications');
  }
};

module.exports = {
  findByUser,
  create,
  markAsRead,
  markAllAsRead,
  countUnread,
};
