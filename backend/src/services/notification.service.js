const db = require('../models');
const ApiError = require('../utils/ApiError');
const { getPagination, getPaginationMeta } = require('../helpers/pagination');

const { Notification } = db;

const getUserNotifications = async (userId, query) => {
  const { page, limit, offset } = getPagination(query);
  const { isRead, type } = query;

  const where = { userId };
  if (isRead !== undefined) {
    where.isRead = isRead === 'true';
  }
  if (type) {
    where.type = type;
  }

  const { count, rows } = await Notification.findAndCountAll({
    where,
    offset,
    limit,
    order: [['createdAt', 'DESC']],
  });

  return { notifications: rows, meta: getPaginationMeta(count, page, limit) };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId },
  });
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  await notification.update({ isRead: true, readAt: new Date() });
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { userId, isRead: false } },
  );
  return { message: 'All notifications marked as read' };
};

const getUnreadCount = async (userId) => {
  const count = await Notification.count({
    where: { userId, isRead: false },
  });
  return { count };
};

const createNotification = async (userId, data) => {
  const notification = await Notification.create({
    userId,
    type: data.type || 'general',
    title: data.title,
    message: data.message,
    data: data.data || null,
  });
  return notification;
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
};
