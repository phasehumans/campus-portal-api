const express = require('express');
const { register } = require('../controllers/auth.controller.js')
const { authenticate, checkRole } = require('../middleware/auth.js');
const { authLimiter } = require('../middleware/commonMiddleware.js');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter);

router.use(authenticate);
router.get('/me',);
router.put('/me',);

router.post('/api-key', );
router.get('/api-keys',);
router.delete('/api-keys/:keyId', );

module.exports = router;
