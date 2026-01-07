const express = require('express');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { getAllCourses, getCourseById, enrollStudent, dropCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/course.controller.js')
const { getCourseMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, downloadMaterial } = require('../controllers/material.controller.js')

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAllCourses);
router.get('/:id', getCourseById);

router.post('/:courseId/enroll', enrollStudent);
router.delete('/:courseId/drop', dropCourse);

router.post('/', checkRole(['admin']), createCourse);
router.put('/:id', checkRole(['admin']), updateCourse);
router.delete('/:id', checkRole(['admin']), deleteCourse);

// Materials routes (nested under courses)
router.get('/:courseId/materials', getCourseMaterials);
router.get('/:courseId/materials/:materialId', getMaterialById);

// Faculty and Admin only
router.post('/:courseId/materials', checkRole(['faculty', 'admin']), createMaterial);
router.put('/:courseId/materials/:materialId', checkRole(['faculty', 'admin']), updateMaterial);
router.delete('/:courseId/materials/:materialId', checkRole(['faculty', 'admin']), deleteMaterial);
router.get('/:courseId/materials/:materialId/download', downloadMaterial);

module.exports = router;
