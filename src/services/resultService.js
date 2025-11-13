const Result = require('../models/Result');
const Notification = require('../models/Notification');

/**
 * Create result (Admin only)
 */
const createResult = async (data) => {
  const { student, course, marks, grade, semester, year, remarks } = data;

  // Check for duplicate
  const existing = await Result.findOne({
    student,
    course,
    semester,
    year,
  });

  if (existing) {
    throw new Error('Result already exists for this student and course');
  }

  const result = new Result({
    student,
    course,
    marks,
    grade,
    semester,
    year,
    remarks,
  });

  await result.save();
  await result.populate('student', 'firstName lastName email');
  await result.populate('course', 'title courseCode');

  return result;
};

/**
 * Publish results
 */
const publishResults = async (resultIds, publishedBy) => {
  const results = await Result.updateMany(
    { _id: { $in: resultIds } },
    {
      isPublished: true,
      publishedAt: new Date(),
      publishedBy,
    }
  );

  // Notify students
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

  return results;
};

/**
 * Get results based on role
 */
const getResults = async (userId, userRole, query = {}) => {
  const filter = { isPublished: true };

  if (userRole === 'student') {
    // Students can only see their own results
    filter.student = userId;
  } else if (userRole === 'faculty') {
    // Faculty can see results for students in their courses
    const Course = require('../models/Course');
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

module.exports = {
  createResult,
  publishResults,
  getResults,
  getStudentResults,
  updateResult,
  deleteResult,
};
