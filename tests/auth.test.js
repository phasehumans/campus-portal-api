const request = require('supertest');
const app = require('../src/index');
const User = require('../src/models/User');
const { signToken } = require('../src/utils/auth');

describe('Authentication', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'testpass123',
      department: 'CS',
      role: 'student',
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          department: 'CS',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.user.role).toBe('student');
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          department: 'CS',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      const token = signToken({
        id: testUser._id,
        email: testUser.email,
        role: testUser.role,
      });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe('test@example.com');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });
});
