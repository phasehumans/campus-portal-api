const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const User = require('../models/user.model');

/**
 * Get student enrollments
 */
const getStudentEnrollments = async (studentId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const enrollments = await Enrollment.find({ student: studentId })
    .populate('course', 'courseCode title semester year')
    .populate('student', 'firstName lastName email')
    .skip(skip)
    .limit(limit);

  const total = await Enrollment.countDocuments({ student: studentId });

  return {
    enrollments,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get course enrollments (Faculty/Admin only)
 */
const getCourseEnrollments = async (courseId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const enrollments = await Enrollment.find({ course: courseId })
    .populate('student', 'firstName lastName email department')
    .skip(skip)
    .limit(limit);

  const total = await Enrollment.countDocuments({ course: courseId });

  return {
    enrollments,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Update enrollment status
 */
const updateEnrollmentStatus = async (enrollmentId, data) => {
  const { status, attendancePercentage } = data;

  const updateData = {};
  if (status) updateData.status = status;
  if (attendancePercentage !== undefined) updateData.attendancePercentage = attendancePercentage;
  updateData.updatedAt = new Date();

  const enrollment = await Enrollment.findByIdAndUpdate(
    enrollmentId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  return enrollment;
};

/**
 * Get enrollment statistics for course
 */
const getCourseEnrollmentStats = async (courseId) => {
  const enrollments = await Enrollment.find({ course: courseId });

  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'active').length,
    completed: enrollments.filter(e => e.status === 'completed').length,
    dropped: enrollments.filter(e => e.status === 'dropped').length,
    suspended: enrollments.filter(e => e.status === 'suspended').length,
    averageAttendance:
      enrollments.reduce((sum, e) => sum + e.attendancePercentage, 0) / enrollments.length || 0,
  };

  return stats;
};

