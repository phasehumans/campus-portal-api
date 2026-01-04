const express = require('express');
const { getAnnouncements, getAnnouncementById, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcement.controller.js');
const { authMiddleware, checkRole } = require('../middleware/auth.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAnnouncements);
router.get('/:id', getAnnouncementById);

router.post('/', checkRole(['faculty', 'admin']), createAnnouncement);

router.put('/:id', checkRole(['faculty', 'admin']), updateAnnouncement);
router.delete('/:id', checkRole(['faculty', 'admin']), deleteAnnouncement);

module.exports = router;
