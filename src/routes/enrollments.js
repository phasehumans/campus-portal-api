const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Get my enrollments (student)
router.get('/my-enrollments', enrollmentController.getStudentEnrollments);

// Get course enrollments (Faculty/Admin)
router.get(
  '/course/:courseId',
  checkRole(['faculty', 'admin']),
  enrollmentController.getCourseEnrollments
);

// Get enrollment statistics (Faculty/Admin)
router.get(
  '/course/:courseId/stats',
  checkRole(['faculty', 'admin']),
  enrollmentController.getEnrollmentStats
);

// Update enrollment (Admin only)
router.put(
  '/:enrollmentId',
  checkRole(['admin']),
  enrollmentController.updateEnrollment
);

module.exports = router;
