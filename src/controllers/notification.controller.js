const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const notificationService = require('../services/notificationService');

/**
 * Get user notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  // const { page, limit } = getPaginationParams(req.query);
  // const result = await notificationService.getUserNotifications(req.user._id, page, limit);

  // sendSuccess(res, result, 'Notifications retrieved successfully');
});

/**
 * Mark notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  // const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  // sendSuccess(res, notification, 'Notification marked as read');
});

/**
 * Mark all as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  // await notificationService.markAllAsRead(req.user._id);
  // sendSuccess(res, {}, 'All notifications marked as read');
});

/**
 * Delete notification
 */
const deleteNotification = asyncHandler(async (req, res) => {
  // const result = await notificationService.deleteNotification(req.params.id, req.user._id);
  // sendSuccess(res, result, 'Notification deleted successfully');
});

module.exports = {
  getNotifications : getNotifications,
  markAsRead : markAsRead,
  markAllAsRead : markAllAsRead,
  deleteNotification : deleteNotification,
};
