const {
  asyncHandler,
  sendSuccess,
  getPaginationParams,
} = require("../utils/responseHandler.js");
const { z } = require("zod");
const { ResultModel } = require("../models/result.model.js");
const { NotificationModel } = require("../models/notification.model.js");
const { success } = require("zod/v4");

const createResult = asyncHandler(async (req, res) => {
  const createResultSchema = z.object({
    student: z.string().min(1, "Student ID is required"),
    course: z.string().min(1, "Course ID is required"),
    marks: z.number().min(0).max(100, "Marks must be between 0 and 100"),
    grade: z.enum([
      "A+",
      "A",
      "A-",
      "B+",
      "B",
      "B-",
      "C+",
      "C",
      "C-",
      "D",
      "F",
    ]),
    semester: z.enum(["fall", "spring", "summer"]),
    year: z.number().int().min(2000),
    remarks: z.string().optional(),
  });

  const parseData = createResultSchema.safeParse(req.body);

  if (!parseData.success) {
    return res.status(400).json({
      success: false,
      message: "invalid input",
      error: parseData.error.flatten(),
    });
  }

  const { student, course, marks, grade, semester, year, remarks } =
    parseData.data;

  try {
    const existing = await ResultModel.findOne({
      student: student,
      course: course,
      semester: semester,
      year: year,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Result already exists for this student and course",
      });
    }

    const result = await ResultModel.create({
      student: student,
      course: course,
      marks: marks,
      grade: grade,
      semester: semester,
      year: year,
      remarks: remarks,
    });

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "errror while creating result",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Result created successfully",
      result: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      errors: error.message,
    });
  }
});

const publishResults = asyncHandler(async (req, res) => {
  const { resultIds } = req.body;

  if (!Array.isArray(resultIds) || resultIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "no result to publish",
    });
  }

  const userId = req.id;

  try {
    const results = await ResultModel.updateMany(
      { _id: { $in: resultIds } },
      {
        isPublished: true,
        publishedAt: new Date(),
        publishBy: userId,
      }
    );

    /* 
    const resultDocs = await Result.find({ _id: { $in: resultIds } })
      .populate('student')
      .populate('course');
  
    for (const result of resultDocs) {
      try {
        await Notification.create({
          recipient: result.student._id,
          title: 'Results Published',
          message: `Your results for ${result.course.title} have been published`,
          type: 'result',
          relatedResource: {
            resourceType: 'result',
            resourceId: result._id,
          },
        });
      } catch (error) {
        console.error('Error creating notification:', error);
      }
    }
    */

    return res.status(200).json({
      success: true,
      message: "Results published successfully",
      results: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      errors: error.message,
    });
  }
});

const getResults = asyncHandler(async (req, res) => {
  const filter = { isPublished: true };
  const { page, limit } = getPaginationParams(req.query);
  const userRole = req.role;
  const userId = req.id;

  try {
    if (userRole == "student") {
      filter.student = userId;
    } else if (userRole == "faculty") {
      const { CourseModel } = require("../models/course.model.js");
      const courses = await CourseModel.find({
        instructor: userId,
      });

      const courseIds = courses.map((c) => c._id);
      filter.course = { $in: courseIds };
    }

    const pageOne = Math.max(1, parseInt(page) || 1);
    const limitOne = Math.min(100, parseInt(limit) || 20);
    const skip = (pageOne - 1) * limitOne;

    const results = await ResultModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitOne);

    const total = await ResultModel.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Results retrieved successfully",
      results: results,
      pagination: {
        total: total,
        pages: Math.ceil(total / limitOne),
        currentPage: pageOne,
        limit: limitOne,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: true,
      message: "server error",
      errors: error.message,
    });
  }

  /* 
  
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;
  */
  // const result = await resultService.getResults(req.user._id, req.user.role, { page, limit });

  // sendSuccess(res, result, 'Results retrieved successfully');
});

const getStudentResults = asyncHandler(async (req, res) => {
  const userId = req.id;
  const studentId = req.params.studentId;
  const userRole = req.role;

  if (userRole === "student" && userId.toString() !== userId) {
    return res.status(400).json({
      success: false,
      message: "not authorized to view this student's results",
    });
  }

  try {
    const result = await ResultModel.find({
      student: studentId,
      isPublished: true,
    }).sort({ year: -1, semester: -1 });

    return res.status(200).json({
      success: true,
      message: "Student results retrieved successfully",
      results: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "server error",
      errors: error.message,
    });
  }
});

const updateResult = asyncHandler(async (req, res) => {
  const updateResultSchema = z.object({
    marks: z.number().min(0).max(100, "Marks must be between 0 and 100"),
    grade: z.enum([
      "A+",
      "A",
      "A-",
      "B+",
      "B",
      "B-",
      "C+",
      "C",
      "C-",
      "D",
      "F",
    ]),
    remarks: z.string().optional(),
  });

  const parseData = updateResultSchema.safeParse(req.body);
  if (!parseData.success) {
    return res.status({
      success: false,
      message: "invalid inputs",
      errors: parseData.error.flatten(),
    });
  }

  const {marks, grade, remarks} = parseData.data
  const resultId = req.params.id

  try {
    const result = await ResultModel.findByIdAndUpdate(
      resultId,
      {
        marks : marks,
        grade : grade,
        remarks : remarks,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!remarks){
      return res.status(400).json({
        success : false,
        message : "result not found"
      })
    }
  
    return res.status({
      success: true,
      message: "Result updated successfully",
      result : result
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const deleteResult = asyncHandler(async (req, res) => {
  const resultId = req.params.id
  const result = await ResultModel.findByIdAndDelete(resultId)

  try {
    if(!result){
      return res.status(400).json({
        success : false,
        message : "result not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Result deleted successfully",
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
  createResult: createResult,
  publishResults: publishResults,
  getResults: getResults,
  getStudentResults: getStudentResults,
  updateResult: updateResult,
  deleteResult: deleteResult,
};
