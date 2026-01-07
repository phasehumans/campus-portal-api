const Attendance = require('../models/attendance.model');
const Course = require('../models/course.model');

/**
 * Mark attendance
 */
const markAttendance = async (data) => {
  const { student, course, date, status, remarks, recordedBy } = data;

  // Check for duplicate
  const existing = await Attendance.findOne({
    student,
    course,
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
    },
  });

  if (existing) {
    throw new Error('Attendance already marked for this date');
  }

  const attendance = new Attendance({
    student,
    course,
    date: new Date(date),
    status,
    remarks,
    recordedBy,
  });

  await attendance.save();
  await attendance.populate('student', 'firstName lastName email');
  await attendance.populate('course', 'title courseCode');

  return attendance;
};

/**
 * Get attendance records
 */
const getAttendanceRecords = async (filters, page = 1, limit = 20) => {
  const query = {};

  if (filters.student) query.student = filters.student;
  if (filters.course) query.course = filters.course;

  const skip = (page - 1) * limit;

  const records = await Attendance.find(query)
    .populate('student', 'firstName lastName email')
    .populate('course', 'title courseCode')
    .populate('recordedBy', 'firstName lastName')
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Attendance.countDocuments(query);

  return {
    records,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get student attendance for course
 */
const getStudentCourseAttendance = async (studentId, courseId) => {
  const records = await Attendance.find({
    student: studentId,
    course: courseId,
  }).sort({ date: 1 });

  const total = records.length;
  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const excused = records.filter(r => r.status === 'excused').length;

  const percentage = total > 0 ? ((present + excused) / total) * 100 : 0;

  return {
    records,
    summary: {
      total,
      present,
      absent,
      late,
      excused,
      percentage: percentage.toFixed(2),
    },
  };
};

/**
 * Bulk mark attendance
 */
const bulkMarkAttendance = async (attendanceData, recordedBy) => {
  const results = [];

  for (const record of attendanceData) {
    try {
      const attendance = await markAttendance({
        ...record,
        recordedBy,
      });
      results.push({ success: true, attendance });
    } catch (error) {
      results.push({
        success: false,
        student: record.student,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Update attendance
 */
const updateAttendance = async (attendanceId, data) => {
  const { status, remarks } = data;

  const updateData = {};
  if (status) updateData.status = status;
  if (remarks !== undefined) updateData.remarks = remarks;
  updateData.updatedAt = new Date();

  const attendance = await Attendance.findByIdAndUpdate(
    attendanceId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  return attendance;
};

/**
 * Delete attendance
 */
const deleteAttendance = async (attendanceId) => {
  const attendance = await Attendance.findByIdAndDelete(attendanceId);

  if (!attendance) {
    throw new Error('Attendance record not found');
  }

  return { message: 'Attendance record deleted successfully' };
};

