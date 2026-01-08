const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { markAttendance, bulkMarkAttendance, getAttendanceRecords, getStudentCourseAttendance, updateAttendance, deleteAttendance} = require('../controllers/attendance.controller.js')

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkRole(['faculty', 'admin']), markAttendance);

router.post('/bulk', checkRole(['faculty', 'admin']), bulkMarkAttendance);

router.get('/records', checkRole(['faculty', 'admin']), getAttendanceRecords);

router.get('/student/:studentId/course/:courseId', checkRole(['faculty', 'admin']), getStudentCourseAttendance);

// Update attendance
router.put('/:id', checkRole(['faculty', 'admin']), updateAttendance);

// Delete attendance
router.delete('/:id', checkRole(['faculty', 'admin']), deleteAttendance);

module.exports = router;
