const resultService = require('../src/services/resultService');
const Result = require('../src/models/Result');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const Notification = require('../src/models/Notification');

describe('Result Service', () => {
  let admin, faculty, student, student2, course;

  beforeEach(async () => {
    admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      department: 'Admin',
      role: 'admin',
    });

    faculty = await User.create({
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

    student2 = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'password123',
      department: 'CS',
      role: 'student',
    });

    course = await Course.create({
      courseCode: 'CS101',
      name: 'Intro to Programming',
      instructor: faculty._id,
      semester: 'Fall',
      year: 2024,
      credits: 3,
      capacity: 30,
    });
  });

  describe('createResult', () => {
    it('should create a new result', async () => {
      const resultData = {
        student: student._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 85,
      };

      const result = await resultService.createResult(resultData, faculty._id);

      expect(result.student.toString()).toBe(student._id.toString());
      expect(result.marks).toBe(85);
      expect(result.grade).toBe('A'); // 85 should be grade A
      expect(result.isPublished).toBe(false);
    });

    it('should calculate correct grade', async () => {
      const testCases = [
        { marks: 90, expectedGrade: 'A' },
        { marks: 80, expectedGrade: 'B' },
        { marks: 70, expectedGrade: 'C' },
        { marks: 60, expectedGrade: 'D' },
        { marks: 50, expectedGrade: 'F' },
      ];

      for (const testCase of testCases) {
        const result = await resultService.createResult(
          {
            student: student._id,
            course: course._id,
            semester: 'Fall',
            year: 2024,
            marks: testCase.marks,
          },
          faculty._id
        );

        expect(result.grade).toBe(testCase.expectedGrade);
      }
    });
  });

  describe('publishResult', () => {
    it('should publish a result', async () => {
      const result = await Result.create({
        student: student._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 85,
        grade: 'A',
        isPublished: false,
      });

      const published = await resultService.publishResult(result._id, admin._id);

      expect(published.isPublished).toBe(true);

      // Check notification was created
      const notification = await Notification.findOne({
        recipient: student._id,
      });
      expect(notification).toBeDefined();
    });

    it('should not publish already published result', async () => {
      const result = await Result.create({
        student: student._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 85,
        grade: 'A',
        isPublished: true,
      });

      await expect(resultService.publishResult(result._id, admin._id))
        .rejects
        .toThrow();
    });
  });

  describe('getResults', () => {
    beforeEach(async () => {
      await Result.create({
        student: student._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 85,
        grade: 'A',
        isPublished: true,
      });

      await Result.create({
        student: student2._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 75,
        grade: 'B',
        isPublished: true,
      });
    });

    it('should return only own results for student', async () => {
      const results = await resultService.getResults(
        { student: student._id },
        student._id,
        'student'
      );

      expect(results.length).toBe(1);
      expect(results[0].student.toString()).toBe(student._id.toString());
    });

    it('should return all course results for faculty', async () => {
      const results = await resultService.getResults(
        { course: course._id },
        faculty._id,
        'faculty'
      );

      expect(results.length).toBe(2);
    });

    it('should return all results for admin', async () => {
      const results = await resultService.getResults(
        {},
        admin._id,
        'admin'
      );

      expect(results.length).toBe(2);
    });
  });

  describe('updateResult', () => {
    it('should update unpublished result', async () => {
      const result = await Result.create({
        student: student._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 85,
        grade: 'A',
        isPublished: false,
      });

      const updated = await resultService.updateResult(
        result._id,
        { marks: 75 },
        faculty._id
      );

      expect(updated.marks).toBe(75);
      expect(updated.grade).toBe('B');
    });

    it('should not update published result', async () => {
      const result = await Result.create({
        student: student._id,
        course: course._id,
        semester: 'Fall',
        year: 2024,
        marks: 85,
        grade: 'A',
        isPublished: true,
      });

      await expect(
        resultService.updateResult(
          result._id,
          { marks: 75 },
          faculty._id
        )
      ).rejects.toThrow();
    });
  });
});
