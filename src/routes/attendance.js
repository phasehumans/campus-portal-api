const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authenticate, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Mark attendance (Faculty/Admin only)
router.post(
  '/',
  checkRole(['faculty', 'admin']),
  attendanceController.markAttendance
);

// Bulk mark attendance (Faculty/Admin only)
router.post(
  '/bulk',
  checkRole(['faculty', 'admin']),
  attendanceController.bulkMarkAttendance
);

// Get attendance records (Faculty/Admin)
router.get(
  '/records',
  checkRole(['faculty', 'admin']),
  attendanceController.getAttendanceRecords
);

// Get student attendance for course
router.get(
  '/student/:studentId/course/:courseId',
  checkRole(['faculty', 'admin']),
  attendanceController.getStudentCourseAttendance
);

// Update attendance
router.put(
  '/:id',
  checkRole(['faculty', 'admin']),
  attendanceController.updateAttendance
);

// Delete attendance
router.delete(
  '/:id',
  checkRole(['faculty', 'admin']),
  attendanceController.deleteAttendance
);

module.exports = router;
