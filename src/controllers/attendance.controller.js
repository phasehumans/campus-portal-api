const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const {AttendanceModel} = require('../models/attendance.model.js')
const {CourseModel} = require('../models/course.model.js')

/**
 * Mark attendance
 */
const markAttendance = asyncHandler(async (req, res) => {
  // const validatedData = createAttendanceSchema.parse(req.body);
  // const attendance = await attendanceService.markAttendance({
  //   ...validatedData,
  //   recordedBy: req.user._id,
  // });

  // sendSuccess(res, attendance, 'Attendance marked successfully', 201);
});

/**
 * Get attendance records
 */
const getAttendanceRecords = asyncHandler(async (req, res) => {
  // const { page, limit } = getPaginationParams(req.query);
  // const result = await attendanceService.getAttendanceRecords(req.query, page, limit);

  // sendSuccess(res, result, 'Attendance records retrieved successfully');
});

/**
 * Get student attendance for course
 */
const getStudentCourseAttendance = asyncHandler(async (req, res) => {
  // const result = await attendanceService.getStudentCourseAttendance(
  //   req.params.studentId,
  //   req.params.courseId
  // );

  // sendSuccess(res, result, 'Attendance summary retrieved successfully');
});

/**
 * Bulk mark attendance
 */
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  // const { attendanceData } = req.body;

  // if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
  //   return sendSuccess(res, {}, 'No attendance data provided', 400);
  // }

  // const results = await attendanceService.bulkMarkAttendance(attendanceData, req.user._id);
  // sendSuccess(res, results, 'Bulk attendance processing completed');
});

/**
 * Update attendance
 */
const updateAttendance = asyncHandler(async (req, res) => {
  // const validatedData = updateAttendanceSchema.parse(req.body);
  // const attendance = await attendanceService.updateAttendance(req.params.id, validatedData);

  // sendSuccess(res, attendance, 'Attendance updated successfully');
});

/**
 * Delete attendance
 */
const deleteAttendance = asyncHandler(async (req, res) => {
  // const result = await attendanceService.deleteAttendance(req.params.id);
  // sendSuccess(res, result, 'Attendance deleted successfully');
});

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getStudentCourseAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
};
