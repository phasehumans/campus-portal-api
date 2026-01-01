const express = require('express');
const announcementController = require('../controllers/announcementController.js');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Public read access for all roles
router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);

// Faculty and Admin only - create
router.post('/', checkRole(['faculty', 'admin']), announcementController.createAnnouncement);

// Faculty and Admin only - update/delete (ownership check in controller)
router.put('/:id', checkRole(['faculty', 'admin']), announcementController.updateAnnouncement);
router.delete('/:id', checkRole(['faculty', 'admin']), announcementController.deleteAnnouncement);

module.exports = router;
