const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const { createCourseSchema, updateCourseSchema } = require('../utils/validation');
const courseService = require('../services/courseService');

/**
 * Create course (Admin only)
 */
const createCourse = asyncHandler(async (req, res) => {
  const validatedData = createCourseSchema.parse(req.body);
  const course = await courseService.createCourse(validatedData);

  sendSuccess(res, course, 'Course created successfully', 201);
});

/**
 * Get all courses
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await courseService.getAllCourses(page, limit, req.query);

  sendSuccess(res, result, 'Courses retrieved successfully');
});

/**
 * Get course by ID
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  sendSuccess(res, course, 'Course retrieved successfully');
});

/**
 * Update course
 */
const updateCourse = asyncHandler(async (req, res) => {
  const validatedData = updateCourseSchema.parse(req.body);
  const course = await courseService.updateCourse(req.params.id, validatedData);

  sendSuccess(res, course, 'Course updated successfully');
});

/**
 * Delete course
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const result = await courseService.deleteCourse(req.params.id);
  sendSuccess(res, result, 'Course deleted successfully');
});

/**
 * Enroll student
 */
const enrollStudent = asyncHandler(async (req, res) => {
  const enrollment = await courseService.enrollStudent(req.user._id, req.params.courseId);
  sendSuccess(res, enrollment, 'Student enrolled successfully', 201);
});

/**
 * Drop course
 */
const dropCourse = asyncHandler(async (req, res) => {
  const enrollment = await courseService.dropCourse(req.user._id, req.params.courseId);
  sendSuccess(res, enrollment, 'Course dropped successfully');
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  dropCourse,
};
