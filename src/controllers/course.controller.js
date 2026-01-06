const { success } = require('zod/v4');
const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const { createCourseSchema, updateCourseSchema } = require('../utils/validation');
const { z } = require('zod');
const { CourseModel } = require('../models/course.model');


const createCourse = asyncHandler(async (req, res) => {
  const createCourseSchema = z.object({
    courseCode: z.string().min(1, "Course code is required").toUpperCase(),
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().optional(),
    credits: z.number().min(1).max(10),
    instructor: z.string().min(1, 'Instructor ID is required'),
    department: z.string().min(1, 'Department is required'),
    semester: z.enum(['fall', 'spring', 'summer']),
    year: z.number().int().min(2000),
    maxStudents: z.number().min(1),
    schedule: z.object({
      days: z.array(z.string()).optional(),
      time: z.string().optional(),
      location: z.string().optional(),
    }).optional(),
  });

  const parseData = createCourseSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errror : parseData.error.flatten()
    })
  }

  const {courseCode, title, description, credits, instructor, department, semester, year, maxStudents, schedule} = parseData.data

  try {
    const existingCourse = await CourseModel.findOne({
      courseCode : courseCode
    })
  
    if(existingCourse){
      return res.status(400).json({
        success: false,
        message: "Course code already exists"
      });
    }
  
    const course = await CourseModel.create({
      courseCode : courseCode,
      title : title,
      description : description,
      credits : credits,
      instructor : instructor,
      department : department,
      semester : semester,
      year : year,
      maxStudents : maxStudents,
      schedule : schedule
    })
  
  
    return res.status(201).json({
      success: true,
      message: "course created successfully",
      course : course
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const filters = req.query
  
  const query = { isActive : true}

  if(filters.department){
    query.department = filters.department
  }

  if(filters.semester){
    query.semester = filters.semester
  }

  if(filters.instructor){
    query.instructor = filters.instructor
  }

  const skip = (page - 1) * limit

  try {
    const courses = await CourseModel.find(query).skip(skip).limit(limit).lean()
    const total = await CourseModel.countDocuments(query)
  
    return res.status(200).json({
      success : true,
      message : "courses retrieved successfully",
      courses : courses,
      pagination : {
        total : total,
        pages : Math.ceil(total / limit),
        currentPage : page,
        limit : limit
      }
    });

  } catch (error) {
    return res.status(500).json({
      succes : false,
      message : "server error",
      errors : error.message
    })
  }
});

const getCourseById = asyncHandler(async (req, res) => {
  const courseId = req.params.id

  try {
    const course = await CourseModel.findById(courseId)
  
    if(!course){
      return res.status(400).json({
        success : false,
        message : "course not found",
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      course : course
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});


const updateCourse = asyncHandler(async (req, res) => {
  const updateCourseSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").optional(),
    description: z.string().optional(),
    credits: z.number().min(1).max(10).optional(),
    maxStudents: z.number().min(1).optional(),
    schedule: z
      .object({
        days: z.array(z.string()).optional(),
        time: z.string().optional(),
        location: z.string().optional(),
      })
      .optional(),
  });

  const parseData = updateCourseSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const { title, description, credits, maxStudents, schedule} = parseData.data
  const courseId = req.params.id

  try {
    const course = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        title : title,
        description : description,
        credits : credits,
        maxStudents : maxStudents,
        schedule : schedule,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!course){
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course : course
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }

});


const deleteCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id

  try {
    const course = await CourseModel.findByIdAndDelete(courseId)
  
    if(!course){
      return res.status(400).json({
        success : false,
        message : "course not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
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
 * Enroll student
 */
const enrollStudent = asyncHandler(async (req, res) => {
  // const enrollment = await courseService.enrollStudent(req.user._id, req.params.courseId);
  // sendSuccess(res, enrollment, 'Student enrolled successfully', 201);
});

/**
 * Drop course
 */
const dropCourse = asyncHandler(async (req, res) => {
  // const enrollment = await courseService.dropCourse(req.user._id, req.params.courseId);
  // sendSuccess(res, enrollment, 'Course dropped successfully');
});

module.exports = {
  createCourse : createCourse,
  getAllCourses : getAllCourses,
  getCourseById : getCourseById,
  updateCourse : updateCourse,
  deleteCourse : deleteCourse,
  enrollStudent : enrollStudent,
  dropCourse : dropCourse,
};
