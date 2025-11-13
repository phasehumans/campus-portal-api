const Notification = require('../models/Notification');

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return {
    notifications,
    unreadCount,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return result;
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return { message: 'Notification deleted successfully' };
};

/**
 * Create notification
 */
const createNotification = async (userId, data) => {
  const { title, message, type, relatedResource } = data;

  const notification = new Notification({
    recipient: userId,
    title,
    message,
    type,
    relatedResource,
  });

  await notification.save();
  return notification;
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
