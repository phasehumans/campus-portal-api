const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const { z } = require('zod')
const {EnrollmentModel} = require('../models/enrollment.model')


const getStudentEnrollments = asyncHandler(async (req, res) => {
  const userId = req.id
  const { page, limit } = getPaginationParams(req.query);
  const skip = (page - 1)*limit

  try {
    const enrollments = await EnrollmentModel.find({
      student : userId,
    }).skip(skip).limit(limit)
  
    const total = await EnrollmentModel.countDocuments({
      student : userId
    })
  
    return res.status(200).json({
      success: true,
      message: "Enrollments retrieved successfully",
      enrollments : enrollments,
      pagination : {
        total : total,
        pages : Math.ceil(total/limit),
        currentPage : page,
        limit : limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }

});

const getCourseEnrollments = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId
  const { page, limit } = getPaginationParams(req.query);
  const skip = (page - 1)*limit

  try {
    const enrollments = await EnrollmentModel.find({
      course : courseId
    }).skip(skip).limit(limit)
  
    const total = await EnrollmentModel.countDocuments({
      course : courseId
    })
  
    return res.status(200).json({
      success: true,
      message: "Course enrollments retrieved successfully",
      enrollments : enrollments,
      pagination : {
        total : total,
        pages : Math.ceil(total/limit),
        currentPage : page,
        limit : limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
  
});

const updateEnrollment = asyncHandler(async (req, res) => {
  const updateEnrollmentSchema = z.object({
    status: z.enum(["active", "completed", "dropped", "suspended"]).optional(),
    attendancePercentage: z.number().min(0).max(100).optional()
  });

  const parseData = updateEnrollmentSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",

    })
  }

  const { status, attendancePercentage} = parseData.data
  const enrollmentId = req.params.enrollmentId

  try {
    const enrollment = await EnrollmentModel.findByIdAndUpdate(
      enrollmentId,
      {
        status : status,
        attendancePercentage : attendancePercentage,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!enrollment){
      return res.status(400).json({
        success : false,
        message : "enrollment not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Enrollment updated successfully",
      enrollment : enrollment
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const getEnrollmentStats = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId

  try {
    const enrollments = await EnrollmentModel.find({
      course : courseId
    })
  
    const stats = {
      total: enrollments.length,
      active: enrollments.filter((e) => e.status === "active").length,
      completed: enrollments.filter((e) => e.status === "completed").length,
      dropped: enrollments.filter((e) => e.status === "dropped").length,
      suspended: enrollments.filter((e) => e.status === "suspended").length,
      averageAttendance:
        enrollments.reduce((sum, e) => sum + e.attendancePercentage, 0) /
          enrollments.length || 0,
    };
  
    return res.status(200).json({
      success: true,
      message: "Enrollment statistics retrieved successfully",
      stats : stats
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
  getStudentEnrollments,
  getCourseEnrollments,
  updateEnrollment,
  getEnrollmentStats,
};
