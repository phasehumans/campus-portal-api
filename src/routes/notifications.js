const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get notifications
router.get('/', notificationController.getNotifications);

// Mark as read
router.put('/:id/read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
