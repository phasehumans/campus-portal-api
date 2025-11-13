const Course = require('../models/Course');
const Material = require('../models/Material');
const Enrollment = require('../models/Enrollment');
const { sendEmail, emailTemplates } = require('../utils/email');

/**
 * Create course (Admin only)
 */
const createCourse = async (data) => {
  const { courseCode, title, credits, instructor, department, semester, year, maxStudents, description, schedule } = data;

  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) {
    throw new Error('Course code already exists');
  }

  const course = new Course({
    courseCode,
    title,
    description,
    credits,
    instructor,
    department,
    semester,
    year,
    maxStudents,
    schedule,
  });

  await course.save();
  await course.populate('instructor', 'firstName lastName email');

  return course;
};

/**
 * Get all courses
 */
const getAllCourses = async (page = 1, limit = 20, filters = {}) => {
  const query = { isActive: true };

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.semester) {
    query.semester = filters.semester;
  }

  if (filters.instructor) {
    query.instructor = filters.instructor;
  }

  const skip = (page - 1) * limit;

  const courses = await Course.find(query)
    .populate('instructor', 'firstName lastName email')
    .populate('enrolledStudents', 'firstName lastName email')
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Course.countDocuments(query);

  return {
    courses,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get course by ID
 */
const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'firstName lastName email department')
    .populate('enrolledStudents', 'firstName lastName email')
    .populate('prerequisites', 'title courseCode');

  if (!course) {
    throw new Error('Course not found');
  }

  return course;
};

/**
 * Update course
 */
const updateCourse = async (courseId, data) => {
  const allowedFields = ['title', 'description', 'credits', 'maxStudents', 'schedule', 'isActive'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const course = await Course.findByIdAndUpdate(
    courseId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!course) {
    throw new Error('Course not found');
  }

  return course;
};

/**
 * Delete course
 */
const deleteCourse = async (courseId) => {
  const course = await Course.findByIdAndDelete(courseId);

  if (!course) {
    throw new Error('Course not found');
  }

  return { message: 'Course deleted successfully' };
};

/**
 * Enroll student in course
 */
const enrollStudent = async (studentId, courseId) => {
  const Course = require('../models/Course');
  const User = require('../models/User');

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error('Course not found');
  }

  // Check capacity
  if (course.enrolledStudents.length >= course.maxStudents) {
    throw new Error('Course is full');
  }

  // Check if already enrolled
  if (course.enrolledStudents.includes(studentId)) {
    throw new Error('Student already enrolled in this course');
  }

  // Create enrollment record
  const enrollment = new Enrollment({
    student: studentId,
    course: courseId,
    status: 'active',
  });

  await enrollment.save();

  // Add student to course
  course.enrolledStudents.push(studentId);
  await course.save();

  // Add course to user
  const user = await User.findByIdAndUpdate(
    studentId,
    { $push: { enrolledCourses: courseId } },
    { new: true }
  );

  // Send confirmation email
  try {
    await sendEmail(
      user.email,
      'Enrollment Confirmed',
      emailTemplates.enrollmentConfirmation(user.firstName, course.title)
    );
  } catch (error) {
    console.error('Email send failed:', error);
  }

  return enrollment;
};

/**
 * Drop course
 */
const dropCourse = async (studentId, courseId) => {
  const course = await Course.findByIdAndUpdate(
    courseId,
    { $pull: { enrolledStudents: studentId } },
    { new: true }
  );

  if (!course) {
    throw new Error('Course not found');
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    { status: 'dropped', updatedAt: new Date() },
    { new: true }
  );

  return enrollment;
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  dropCourse,
};
