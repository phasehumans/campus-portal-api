const courseService = require('../src/services/courseService');
const Course = require('../src/models/Course');
const User = require('../src/models/User');
const Enrollment = require('../src/models/Enrollment');

describe('Course Service', () => {
  let instructor, student, course;

  beforeEach(async () => {
    instructor = await User.create({
      firstName: 'Prof',
      lastName: 'Smith',
      email: 'prof@example.com',
      password: 'password123',
      department: 'CS',
      role: 'faculty',
    });

    student = await User.create({
      firstName: 'John',
      lastName: 'Student',
      email: 'student@example.com',
      password: 'password123',
      department: 'CS',
      role: 'student',
    });

    course = await Course.create({
      courseCode: 'CS101',
      name: 'Intro to Programming',
      instructor: instructor._id,
      semester: 'Fall',
      year: 2024,
      credits: 3,
      capacity: 30,
    });
  });

  describe('createCourse', () => {
    it('should create a new course', async () => {
      const courseData = {
        courseCode: 'CS201',
        name: 'Data Structures',
        instructor: instructor._id,
        semester: 'Spring',
        year: 2024,
        credits: 3,
        capacity: 30,
      };

      const result = await courseService.createCourse(courseData, instructor._id);

      expect(result.courseCode).toBe('CS201');
      expect(result.instructor.toString()).toBe(instructor._id.toString());
    });

    it('should reject duplicate course code', async () => {
      const courseData = {
        courseCode: 'CS101',
        name: 'Different Name',
        instructor: instructor._id,
        semester: 'Spring',
        year: 2024,
        credits: 3,
        capacity: 30,
      };

      await expect(courseService.createCourse(courseData, instructor._id))
        .rejects
        .toThrow();
    });
  });

  describe('enrollStudent', () => {
    it('should enroll student in course', async () => {
      const result = await courseService.enrollStudent(
        course._id,
        student._id
      );

      expect(result.enrolled).toContain(student._id.toString());

      const enrollment = await Enrollment.findOne({
        student: student._id,
        course: course._id,
      });
      expect(enrollment).toBeDefined();
      expect(enrollment.status).toBe('active');
    });

    it('should reject duplicate enrollment', async () => {
      await courseService.enrollStudent(course._id, student._id);

      await expect(
        courseService.enrollStudent(course._id, student._id)
      ).rejects.toThrow();
    });

    it('should reject enrollment when course is full', async () => {
      const fullCourse = await Course.create({
        courseCode: 'CS999',
        name: 'Full Course',
        instructor: instructor._id,
        semester: 'Fall',
        year: 2024,
        credits: 3,
        capacity: 1,
        enrolled: [],
      });

      const student2 = await User.create({
        firstName: 'Jane',
        lastName: 'Student',
        email: 'jane@example.com',
        password: 'password123',
        department: 'CS',
        role: 'student',
      });

      // Fill the course
      await courseService.enrollStudent(fullCourse._id, student._id);

      // Try to enroll another student
      await expect(
        courseService.enrollStudent(fullCourse._id, student2._id)
      ).rejects.toThrow();
    });
  });

  describe('getCourse', () => {
    it('should get course details', async () => {
      const result = await courseService.getCourse(course._id);

      expect(result.courseCode).toBe('CS101');
      expect(result.name).toBe('Intro to Programming');
    });

    it('should return null for non-existent course', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const result = await courseService.getCourse(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('dropCourse', () => {
    it('should drop student from course', async () => {
      await courseService.enrollStudent(course._id, student._id);
      const result = await courseService.dropCourse(course._id, student._id);

      expect(result.enrolled).not.toContain(student._id.toString());

      const enrollment = await Enrollment.findOne({
        student: student._id,
        course: course._id,
      });
      expect(enrollment.status).toBe('dropped');
    });
  });
});
