const { success } = require('zod/v4');
const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler.js');
const { z } = require('zod')
const { ResultModel } = require('../models/result.model.js')
const {NotificationModel} = require('../models/notification.model.js')

const createResult = asyncHandler(async (req, res) => {
  const createResultSchema = z.object({
    student: z.string().min(1, "Student ID is required"),
    course: z.string().min(1, 'Course ID is required'),
    marks: z.number().min(0).max(100, 'Marks must be between 0 and 100'),
    grade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
    semester: z.enum(['fall', 'spring', 'summer']),
    year: z.number().int().min(2000),
    remarks: z.string().optional(),
  });

  const parseData = createResultSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid input",
      error : parseData.error.flatten()
    })
  }

  const { student, course, marks, grade, semester, year, remarks } = parseData.data
  
  try {
    const existing = await ResultModel.findOne({
      student : student,
      course : course,
      semester : semester,
      year : year
    })
  
    if(existing){
      return res.status(400).json({
        success: false,
        message: "Result already exists for this student and course"
      });
    }
  
    const result = await ResultModel.create({
      student : student,
      course : course,
      marks : marks,
      grade : grade,
      semester : semester,
      year : year,
      remarks : remarks
    })
  
    if(!result){
      return res.status(400).json({
        success : false,
        message : "errror while creating result"
      })
    }
  
    return res.status(201).json({
      success: true,
      message: "Result created successfully",
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
      results : results
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
 * Get results
 */
const getResults = asyncHandler(async (req, res) => {
  // const { page, limit } = getPaginationParams(req.query);
  // const result = await resultService.getResults(req.user._id, req.user.role, { page, limit });

  // sendSuccess(res, result, 'Results retrieved successfully');
});

/**
 * Get student results
 */
const getStudentResults = asyncHandler(async (req, res) => {
  // const results = await resultService.getStudentResults(
  //   req.params.studentId,
  //   req.user._id,
  //   req.user.role
  // );

  // sendSuccess(res, results, 'Student results retrieved successfully');
});

/**
 * Update result
 */
const updateResult = asyncHandler(async (req, res) => {
  // const validatedData = updateResultSchema.parse(req.body);
  // const result = await resultService.updateResult(req.params.id, validatedData);

  // sendSuccess(res, result, 'Result updated successfully');
});

/**
 * Delete result
 */
const deleteResult = asyncHandler(async (req, res) => {
  // const result = await resultService.deleteResult(req.params.id);
  // sendSuccess(res, result, 'Result deleted successfully');
});

module.exports = {
  createResult : createResult,
  publishResults : publishResults,
  getResults : getResults,
  getStudentResults : getStudentResults,
  updateResult : updateResult,
  deleteResult : deleteResult,
};
