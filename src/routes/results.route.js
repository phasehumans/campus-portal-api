const express = require('express');
const resultController = require('../controllers/result.controller');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get results - role based
router.get('/', resultController.getResults);
router.get('/:studentId', resultController.getStudentResults);

// Admin only - create/update/delete
router.post('/', checkRole(['admin']), resultController.createResult);
router.post('/publish', checkRole(['admin']), resultController.publishResults);
router.put('/:id', checkRole(['admin']), resultController.updateResult);
router.delete('/:id', checkRole(['admin']), resultController.deleteResult);

module.exports = router;
