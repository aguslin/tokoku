const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');

const getUserNotifications = catchAsync(async (req, res) => {
  const data = await notificationService.getUserNotifications(req.user.id, req.query);
  ApiResponse.success(res, data, 'Notifications retrieved successfully');
});

const markAsRead = catchAsync(async (req, res) => {
  const data = await notificationService.markAsRead(req.params.id, req.user.id);
  ApiResponse.success(res, data, 'Notification marked as read');
});

const markAllAsRead = catchAsync(async (req, res) => {
  const data = await notificationService.markAllAsRead(req.user.id);
  ApiResponse.success(res, data, 'All notifications marked as read');
});

const getUnreadCount = catchAsync(async (req, res) => {
  const data = await notificationService.getUnreadCount(req.user.id);
  ApiResponse.success(res, data, 'Unread count retrieved successfully');
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
