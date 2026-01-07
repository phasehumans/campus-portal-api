const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth.js');
const {getEvents, getEventById, registerForEvent, unregisterFromEvent, createEvent, updateEvent, deleteEvent} = require('../controllers/event.controller.js')

const router = express.Router();

router.use(authMiddleware);

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post('/:id/register', registerForEvent);
router.delete('/:id/register', unregisterFromEvent);

router.post('/', checkRole(['admin', 'faculty']), createEvent);
router.put('/:id', checkRole(['admin', 'faculty']), updateEvent);
router.delete('/:id', checkRole(['admin']), deleteEvent);

module.exports = router;
