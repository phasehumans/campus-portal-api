const express = require('express');
const courseController = require('../controllers/courseController');
const { authMiddleware, checkRole } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Public read access
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Student enrollment
router.post('/:courseId/enroll', courseController.enrollStudent);
router.delete('/:courseId/drop', courseController.dropCourse);

// Admin only - create/update/delete
router.post('/', checkRole(['admin']), courseController.createCourse);
router.put('/:id', checkRole(['admin']), courseController.updateCourse);
router.delete('/:id', checkRole(['admin']), courseController.deleteCourse);

// Materials routes (nested under courses)
const materialController = require('../controllers/materialController');

router.get('/:courseId/materials', materialController.getCourseMaterials);
router.get('/:courseId/materials/:materialId', materialController.getMaterialById);

// Faculty and Admin only
router.post(
  '/:courseId/materials',
  checkRole(['faculty', 'admin']),
  materialController.createMaterial
);

router.put(
  '/:courseId/materials/:materialId',
  checkRole(['faculty', 'admin']),
  materialController.updateMaterial
);

router.delete(
  '/:courseId/materials/:materialId',
  checkRole(['faculty', 'admin']),
  materialController.deleteMaterial
);

router.get('/:courseId/materials/:materialId/download', materialController.downloadMaterial);

module.exports = router;
