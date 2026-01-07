const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { getStudentEnrollments, getCourseEnrollments, getEnrollmentStats, updateEnrollment} = require('../controllers/enrollment.controller.js')

const router = express.Router();

router.use(authMiddleware);

// Get my enrollments (student)
router.get('/my-enrollments', getStudentEnrollments);

// Get course enrollments (Faculty/Admin)
router.get('/course/:courseId', checkRole(['faculty', 'admin']), getCourseEnrollments);

// Get enrollment statistics (Faculty/Admin)
router.get('/course/:courseId/stats', checkRole(['faculty', 'admin']), getEnrollmentStats);

// Update enrollment (Admin only)
router.put('/:enrollmentId', checkRole(['admin']), updateEnrollment);

module.exports = router;
