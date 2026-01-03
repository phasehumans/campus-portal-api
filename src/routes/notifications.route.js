const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get notifications
router.get('/', notificationController.getNotifications);

// Mark as read
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
