# Testing Documentation

## Overview

The Campus Portal Backend includes a comprehensive test suite using Jest and Supertest, covering unit tests for services, integration tests for routes, and authentication tests.

## Test Structure

```
tests/
├── setup.js                          # Jest setup file (database connection/cleanup)
├── auth.test.js                      # Authentication endpoint tests
├── courseService.test.js             # Course service unit tests
├── resultService.test.js             # Result service unit tests
├── announcementService.test.js       # Announcement service unit tests
└── routes.integration.test.js        # Integration tests for routes
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test -- tests/auth.test.js
```

### Run tests with coverage report
```bash
npm test -- --coverage
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="should"
```

## Test Coverage

The test suite aims for the following coverage thresholds:
- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

Current coverage can be viewed in the `coverage/` directory after running tests.

## Test Files Explained

### 1. setup.js

**Purpose**: Jest setup file that runs before all tests

**Functionality**:
- Connects to MongoDB test database
- Clears all collections before each test
- Disconnects from database after all tests

**Configuration**:
```javascript
MONGODB_TEST_URI=mongodb://localhost:27017/campus-portal-test
```

**Key Functions**:
- `beforeAll()`: Connect to test database
- `beforeEach()`: Clear all collections
- `afterAll()`: Disconnect from database

### 2. auth.test.js

**Purpose**: Test authentication endpoints and functionality

**Test Suites**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

**Test Cases**:
```
✓ Register new user
✓ Reject duplicate email
✓ Login with valid credentials
✓ Reject invalid credentials
✓ Get current user with token
✓ Reject request without token
```

**Example**:
```javascript
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
});
```

### 3. courseService.test.js

**Purpose**: Unit tests for course service business logic

**Test Suites**:
- `createCourse` - Course creation
- `enrollStudent` - Student enrollment
- `getCourse` - Retrieve course details
- `dropCourse` - Student drops course

**Test Cases**:
```
✓ Create new course
✓ Reject duplicate course code
✓ Enroll student in course
✓ Prevent duplicate enrollment
✓ Reject enrollment when full
✓ Get course details
✓ Drop student from course
```

**Coverage Areas**:
- Course creation validation
- Enrollment capacity enforcement
- Duplicate prevention
- Null/error handling

### 4. resultService.test.js

**Purpose**: Unit tests for result (grade) service

**Test Suites**:
- `createResult` - Result creation and grading
- `publishResult` - Publish results to students
- `getResults` - Role-based result retrieval
- `updateResult` - Update unpublished results

**Test Cases**:
```
✓ Create new result
✓ Calculate correct grade based on marks
✓ Publish result and create notification
✓ Prevent publishing already published result
✓ Filter results by student role
✓ Filter results by faculty role
✓ Return all results for admin
✓ Update unpublished result
✓ Prevent updating published result
```

**Grade Calculation**:
```
90-100: A
80-89:  B
70-79:  C
60-69:  D
< 60:   F
```

### 5. announcementService.test.js

**Purpose**: Unit tests for announcement service

**Test Suites**:
- `createAnnouncement` - Announcement creation
- `getAnnouncements` - Role-based retrieval
- `pinAnnouncement` - Pin/unpin announcements
- `trackView` - View tracking

**Test Cases**:
```
✓ Create announcement by faculty
✓ Create announcement by admin
✓ Filter announcements by student role
✓ Filter announcements by faculty role
✓ Return all announcements for admin
✓ Pin announcement
✓ Unpin announcement
✓ Track announcement views
✓ Prevent duplicate views from same user
```

**Role-Based Visibility**:
- Students see: announcements targeting 'student' role
- Faculty see: announcements targeting 'faculty' role
- Admin see: all announcements

### 6. routes.integration.test.js

**Purpose**: Integration tests for API routes with real HTTP requests

**Test Suites**:

#### Course Routes
- `POST /api/courses` - Create course (admin only)
- `GET /api/courses` - List all courses
- `GET /api/courses/:courseId` - Get course details
- `POST /api/courses/:courseId/enroll` - Enroll student
- `POST /api/courses/:courseId/drop` - Drop course

#### Announcement Routes
- `POST /api/announcements` - Create announcement (faculty/admin)
- `GET /api/announcements` - List announcements
- `PUT /api/announcements/:announcementId/pin` - Pin announcement (admin)

**Test Cases**:
```
✓ Create course as admin
✓ Reject course creation by student
✓ List all courses
✓ Get course details
✓ Return 404 for non-existent course
✓ Enroll student in course
✓ Prevent duplicate enrollment
✓ Reject unauthenticated enrollment
✓ Drop student from course
✓ Create announcement as faculty
✓ Reject announcement creation by student
✓ List announcements visible to role
✓ Pin announcement as admin
✓ Reject pin by student
```

## Environment Setup for Tests

Create a `.env.test` file with:

```env
NODE_ENV=test
MONGODB_TEST_URI=mongodb://localhost:27017/campus-portal-test
JWT_SECRET=test-secret-key-for-testing-only-12345
JWT_EXPIRATION=7d
PORT=3001
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=test@example.com
SMTP_PASS=test-password
SENDER_EMAIL=test@example.com
```

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:4.4
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run lint
      - run: npm test -- --coverage
      
      - uses: codecov/codecov-action@v2
        with:
          files: ./coverage/lcov.info
```

## Writing New Tests

### Test Structure Template

```javascript
const User = require('../src/models/User');
const someService = require('../src/services/someService');

describe('Feature Name', () => {
  let testData;

  beforeEach(async () => {
    // Setup test data
    testData = await User.create({ /* ... */ });
  });

  describe('specific functionality', () => {
    it('should do something', async () => {
      const result = await someService.doSomething(testData);
      
      expect(result).toBeDefined();
      expect(result.property).toBe(expectedValue);
    });

    it('should handle error case', async () => {
      await expect(someService.invalidCall())
        .rejects
        .toThrow();
    });
  });
});
```

### Best Practices

1. **Arrange-Act-Assert Pattern**
   ```javascript
   // Arrange: Setup
   const user = await User.create({ /* ... */ });
   
   // Act: Execute
   const result = await userService.getUser(user._id);
   
   // Assert: Verify
   expect(result._id.toString()).toBe(user._id.toString());
   ```

2. **Use Descriptive Test Names**
   ```javascript
   // Good
   it('should reject login with incorrect password')
   
   // Bad
   it('should fail')
   ```

3. **Test One Thing Per Test**
   ```javascript
   // Good: One assertion focus
   it('should create user with correct role', async () => {
     const user = await User.create({ role: 'student' });
     expect(user.role).toBe('student');
   });
   
   // Bad: Multiple unrelated assertions
   it('should create user', async () => {
     const user = await User.create({ /* ... */ });
     expect(user.email).toBe(email);
     expect(user.firstName).toBe(firstName);
     expect(user.role).toBe(role);
   });
   ```

4. **Clean Up Data**
   ```javascript
   afterEach(async () => {
     // Cleanup happens automatically via setup.js
     // But you can add custom cleanup if needed
   });
   ```

## Debugging Tests

### Run single test
```bash
npm test -- tests/auth.test.js -t "should login"
```

### Debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose output
```bash
npm test -- --verbose
```

## Common Issues

### MongoDB Connection Error
**Issue**: Tests timeout trying to connect to MongoDB
**Solution**: Ensure MongoDB is running and `MONGODB_TEST_URI` is correct

### Async Timeout
**Issue**: Test times out waiting for async operation
**Solution**: Increase timeout in jest.config.js: `testTimeout: 30000`

### Token Verification Fails
**Issue**: JWT token invalid in tests
**Solution**: Use `signToken()` helper with test JWT_SECRET

### Duplicate Key Error
**Issue**: Unique constraint violation
**Solution**: `beforeEach()` in setup.js clears collections automatically

## Coverage Goals

Current implementation targets:
- **Unit Tests**: 60%+ coverage on services
- **Integration Tests**: All route endpoints with happy path + error cases
- **Total**: 50%+ overall coverage (enforced in jest.config.js)

## Next Steps

1. Add tests for remaining services:
   - materialService
   - eventService
   - enrollmentService
   - attendanceService

2. Add integration tests for:
   - Admin endpoints
   - Results endpoints
   - Event endpoints
   - Notification endpoints

3. Add E2E tests for complete user workflows:
   - Student enrollment flow
   - Faculty grading workflow
   - Admin user management

4. Setup performance testing:
   - Load testing with Artillery
   - Database query optimization verification

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Testing Best Practices](https://docs.mongodb.com/drivers/node/current/usage-examples/insertOne/)
- [Express Testing Patterns](https://expressjs.com/en/guide/testing.html)
