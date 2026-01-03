const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth.js');
const { getAllUsers, getUserById, updateUserRole, deactivateUser, activateUser, getStats } = require('../controllers/admin.controller.js');

const router = express.Router();

router.use(authMiddleware, checkRole(['admin']));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/activate', activateUser);

router.get('/stats', getStats);

module.exports = router;
