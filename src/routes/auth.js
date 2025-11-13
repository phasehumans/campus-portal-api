const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, checkRole } = require('../middleware/auth');
const { authLimiter } = require('../middleware/commonMiddleware');

const router = express.Router();

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

// Protected routes
router.use(authenticate);

router.get('/me', authController.getCurrentUser);
router.put('/me', authController.updateProfile);

// API Key routes
router.post('/api-key', authController.createApiKey);
router.get('/api-keys', authController.listApiKeys);
router.delete('/api-keys/:keyId', authController.revokeApiKey);

module.exports = router;
