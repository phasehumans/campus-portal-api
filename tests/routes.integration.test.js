const request = require('supertest');
const app = require('../src/index');
const Course = require('../src/models/Course');
const User = require('../src/models/User');
const Announcement = require('../src/models/Announcement');
const { signToken } = require('../src/utils/auth');

describe('Course Routes Integration', () => {
  let adminToken, facultyToken, studentToken;
  let admin, faculty, student, course;

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

    adminToken = signToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    facultyToken = signToken({
      id: faculty._id,
      email: faculty.email,
      role: faculty.role,
    });

    studentToken = signToken({
      id: student._id,
      email: student.email,
      role: student.role,
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

  describe('POST /api/courses', () => {
    it('should create course as admin', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          courseCode: 'CS201',
          name: 'Data Structures',
          instructor: faculty._id,
          semester: 'Spring',
          year: 2024,
          credits: 3,
          capacity: 30,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.courseCode).toBe('CS201');
    });

    it('should reject course creation by student', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          courseCode: 'CS201',
          name: 'Data Structures',
          instructor: faculty._id,
          semester: 'Spring',
          year: 2024,
          credits: 3,
          capacity: 30,
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/courses', () => {
    it('should list all courses', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/courses/:courseId', () => {
    it('should get course details', async () => {
      const response = await request(app)
        .get(`/api/courses/${course._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.courseCode).toBe('CS101');
    });

    it('should return 404 for non-existent course', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/courses/${fakeId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/courses/:courseId/enroll', () => {
    it('should enroll student in course', async () => {
      const response = await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('enrolled');
    });

    it('should reject duplicate enrollment', async () => {
      // First enrollment
      await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Attempt duplicate
      const response = await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject unauthenticated enrollment', async () => {
      const response = await request(app)
        .post(`/api/courses/${course._id}/enroll`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/courses/:courseId/drop', () => {
    it('should drop student from course', async () => {
      // Enroll first
      await request(app)
        .post(`/api/courses/${course._id}/enroll`)
        .set('Authorization', `Bearer ${studentToken}`);

      // Drop course
      const response = await request(app)
        .post(`/api/courses/${course._id}/drop`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('dropped');
    });
  });
});

describe('Announcement Routes Integration', () => {
  let adminToken, facultyToken, studentToken;
  let admin, faculty, student, announcement;

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

    adminToken = signToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    facultyToken = signToken({
      id: faculty._id,
      email: faculty.email,
      role: faculty.role,
    });

    studentToken = signToken({
      id: student._id,
      email: student.email,
      role: student.role,
    });

    announcement = await Announcement.create({
      title: 'Test Announcement',
      content: 'This is a test',
      category: 'Academic',
      author: faculty._id,
      targetRoles: ['student', 'faculty'],
    });
  });

  describe('POST /api/announcements', () => {
    it('should create announcement as faculty', async () => {
      const response = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          title: 'New Announcement',
          content: 'Important information',
          category: 'Academic',
          targetRoles: ['student'],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.title).toBe('New Announcement');
    });

    it('should reject announcement creation by student', async () => {
      const response = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized',
          content: 'Should fail',
          category: 'Academic',
          targetRoles: ['student'],
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/announcements', () => {
    it('should list announcements visible to student', async () => {
      const response = await request(app)
        .get('/api/announcements')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/announcements/:announcementId/pin', () => {
    it('should pin announcement as admin', async () => {
      const response = await request(app)
        .put(`/api/announcements/${announcement._id}/pin`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isPinned).toBe(true);
    });

    it('should reject pin by student', async () => {
      const response = await request(app)
        .put(`/api/announcements/${announcement._id}/pin`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(403);
    });
  });
});
