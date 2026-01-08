const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notification.controller.js')
const { authMiddleware } = require('../middleware/auth.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getNotifications);

router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);

router.delete('/:id', deleteNotification);

module.exports = router;
