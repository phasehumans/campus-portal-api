const express = require('express');
const eventController = require('../controllers/eventController');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Public read access
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Register/Unregister for events
router.post('/:id/register', eventController.registerForEvent);
router.delete('/:id/register', eventController.unregisterFromEvent);

// Admin only - create/update/delete
router.post('/', checkRole(['admin', 'faculty']), eventController.createEvent);
router.put('/:id', checkRole(['admin', 'faculty']), eventController.updateEvent);
router.delete('/:id', checkRole(['admin']), eventController.deleteEvent);

module.exports = router;
