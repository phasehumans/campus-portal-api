const Result = require('../models/result.model');
const Notification = require('../models/notification.model');

const getResults = async (userId, userRole, query = {}) => {
  const filter = { isPublished: true };

  if (userRole === 'student') {
    // Students can only see their own results
    filter.student = userId;
  } else if (userRole === 'faculty') {
    // Faculty can see results for students in their courses
    const Course = require('../models/course.model');
    const courses = await Course.find({ instructor: userId });
    const courseIds = courses.map(c => c._id);
    filter.course = { $in: courseIds };
  }
  // Admin can see all results

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  const results = await Result.find(filter)
    .populate('student', 'firstName lastName email')
    .populate('course', 'title courseCode')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Result.countDocuments(filter);

  return {
    results,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get student results
 */
const getStudentResults = async (studentId, userId, userRole) => {
  // Check authorization
  if (userRole === 'student' && userId.toString() !== studentId) {
    throw new Error('Not authorized to view this student\'s results');
  }

  const results = await Result.find({
    student: studentId,
    isPublished: true,
  })
    .populate('course', 'title courseCode credits')
    .sort({ year: -1, semester: -1 });

  return results;
};

/**
 * Update result
 */
const updateResult = async (resultId, data) => {
  const { marks, grade, remarks } = data;

  const result = await Result.findByIdAndUpdate(
    resultId,
    {
      marks: marks !== undefined ? marks : undefined,
      grade: grade || undefined,
      remarks: remarks !== undefined ? remarks : undefined,
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!result) {
    throw new Error('Result not found');
  }

  return result;
};

/**
 * Delete result
 */
const deleteResult = async (resultId) => {
  const result = await Result.findByIdAndDelete(resultId);

  if (!result) {
    throw new Error('Result not found');
  }

  return { message: 'Result deleted successfully' };
};

