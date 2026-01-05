const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { getResults, getStudentResults, createResult, publishResults, updateResult, deleteResult} = require('../controllers/result.controller.js')

const router = express.Router();

router.use(authMiddleware);

// Get results - role based
router.get('/', getResults);
router.get('/:studentId', getStudentResults);

// Admin only - create/update/delete
router.post('/', checkRole(['admin']), createResult);
router.post('/publish', checkRole(['admin']), publishResults);
router.put('/:id', checkRole(['admin']), updateResult);
router.delete('/:id', checkRole(['admin']), deleteResult);

module.exports = router;
