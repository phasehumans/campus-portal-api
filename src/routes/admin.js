const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(authMiddleware, checkRole(['admin']));

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/activate', adminController.activateUser);

// Statistics
router.get('/stats', adminController.getStats);

module.exports = router;
