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

const getStudentCourseAttendance = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId
  const courseId = req.params.courseId

  try {
    const records = await AttendanceModel.find({
      student : studentId,
      course : courseId
    }).sort({date : -1})
  
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const excused = records.filter((r) => r.status === "excused").length;
  
    const percentage = total > 0 ? ((present + excused) / total) * 100 : 0;
  
    return res.status(200).json({
      success: true,
      message: "Attendance summary retrieved successfully",
      records : records,
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        percentage: percentage.toFixed(2),
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

const updateAttendance = asyncHandler(async (req, res) => {
  const updateAttendanceSchema = z.object({
    status: z.enum(["present", "absent", "late", "excused"]),
    remarks: z.string().optional(),
  });

  const parseData = updateAttendanceSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const {status, remarks} = parseData.data
  const attendanceId = req.params.id

  try {
    const attendance = await AttendanceModel.findByIdAndUpdate(
      attendanceId,
      {
        status : status,
        remarks : remarks,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!attendance){
      return res.status(400).json({
        success: false,
        message: "Attendance record not found",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
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

const deleteAttendance = asyncHandler(async (req, res) => {
  const attendanceId = req.params.id

  try {
    const attendance = await AttendanceModel.findByIdAndDelete(attendanceId)
  
    if(!attendance){
      return res.status(400).json({
        success : false,
        message : "attendance not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
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

module.exports = {
  markAttendance,
  getAttendanceRecords,
  getStudentCourseAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
};
