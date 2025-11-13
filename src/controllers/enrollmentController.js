const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const enrollmentService = require('../services/enrollmentService');
const { updateEnrollmentSchema } = require('../utils/validation');

/**
 * Get student enrollments
 */
const getStudentEnrollments = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await enrollmentService.getStudentEnrollments(req.user._id, page, limit);

  sendSuccess(res, result, 'Enrollments retrieved successfully');
});

/**
 * Get course enrollments (Faculty/Admin only)
 */
const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await enrollmentService.getCourseEnrollments(req.params.courseId, page, limit);

  sendSuccess(res, result, 'Course enrollments retrieved successfully');
});

/**
 * Update enrollment
 */
const updateEnrollment = asyncHandler(async (req, res) => {
  const validatedData = updateEnrollmentSchema.parse(req.body);
  const enrollment = await enrollmentService.updateEnrollmentStatus(
    req.params.enrollmentId,
    validatedData
  );

  sendSuccess(res, enrollment, 'Enrollment updated successfully');
});

/**
 * Get enrollment statistics
 */
const getEnrollmentStats = asyncHandler(async (req, res) => {
  const stats = await enrollmentService.getCourseEnrollmentStats(req.params.courseId);
  sendSuccess(res, stats, 'Enrollment statistics retrieved successfully');
});

module.exports = {
  getStudentEnrollments,
  getCourseEnrollments,
  updateEnrollment,
  getEnrollmentStats,
};
