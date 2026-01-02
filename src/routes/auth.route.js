const express = require('express');
const { register, login, getCurrentUser, updateProfile, createApiKey } = require('../controllers/auth.controller.js')
const { authMiddleware, checkRole } = require('../middleware/auth.js');
const { authLimiter } = require('../middleware/commonMiddleware.js');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

router.use(authMiddleware);
router.get('/me', getCurrentUser);
router.put('/me', updateProfile);

router.post('/api-key', createApiKey);
router.get('/api-keys',);
router.delete('/api-keys/:keyId', );

module.exports = router;
