const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth.js');
const { getAllUsers, getUserById } = require('../controllers/admin.controller.js');

const router = express.Router();

router.use(authMiddleware, checkRole(['admin']));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role',);
router.put('/users/:id/deactivate',);
router.put('/users/:id/activate',);

// Statistics
router.get('/stats',);

module.exports = router;
