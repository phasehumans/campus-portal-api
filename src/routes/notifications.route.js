const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notification.controller.js')
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get notifications
router.get('/', getNotifications);

// Mark as read
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

// Delete
router.delete('/:id', deleteNotification);

module.exports = router;
