const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const {AttendanceModel} = require('../models/attendance.model.js')
const {CourseModel} = require('../models/course.model.js')
const { z } = require('zod');
const { success, record, date } = require('zod/v4');


const markAttendance = asyncHandler(async (req, res) => {
  const createAttendanceSchema = z.object({
    student: z.string().min(1, "Student ID is required"),
    course: z.string().min(1, 'Course ID is required'),
    date: z.string().datetime(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    remarks: z.string().optional(),
  });

  const parseData = createAttendanceSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs"
    })
  }

  const {student, course, date, status, remarks} = parseData.data
  const userId = req.id

  try {
    const existing = await AttendanceModel.findOne({
      student: student,
      course: course,
      date: {
        $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
      }
    });
  
    if(existing){
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for this date",
      });
    }
  
    const attendance = await AttendanceModel.create({
      student : student,
      course : course,
      date : new Date(date),
      status : status,
      remarks : remarks,
      markedBy : userId
    })
  
    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance : attendance
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const getAttendanceRecords = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const skip = (page - 1) * limit
  const query = req.query

  const filters = {}

  if(query.student){
    filters.student = query.student
  }

  if(query.course){
    filters.course = query.course
  }

  try {
    const records = await AttendanceModel.find(filters).sort({date : -1}).skip(skip).limit(limit)
    const total = await AttendanceModel.countDocuments(filters)
  
    return res.status(200).json({
      success: true,
      message: "Attendance records retrieved successfully",
      records: records,
      pagination: {
        total : total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit : limit,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
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

const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { attendanceData } = req.body;

  if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No attendance data provided",
    });
  }

  const userId = req.id
  const results = []

  try {
    for(record of attendanceData){
      try {
        const attendance = await AttendanceModel.create({
          ...record,
          markedBy : userId
        })
  
        results.push({success : true, attendance : attendance})
      } catch (error) {
        results.push({success : false, student : record.student})
      }
    }
  
    return res.status(200).json({
      success: true,
      message: "Bulk attendance processing completed",
      attendance : results
    });
  
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
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
