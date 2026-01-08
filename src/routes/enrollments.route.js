const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { getStudentEnrollments, getCourseEnrollments, getEnrollmentStats, updateEnrollment} = require('../controllers/enrollment.controller.js')

const router = express.Router();

router.use(authMiddleware);

router.get('/my-enrollments', getStudentEnrollments);

router.get('/course/:courseId', checkRole(['faculty', 'admin']), getCourseEnrollments);

router.get('/course/:courseId/stats', checkRole(['faculty', 'admin']), getEnrollmentStats);

router.put('/:enrollmentId', checkRole(['admin']), updateEnrollment);

module.exports = router;
