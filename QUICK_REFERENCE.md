# Campus Portal Backend - Quick Reference Guide

## 🚀 Quick Start

```bash
# Install
npm install

# Development
npm run dev                 # Start with nodemon
npm run lint              # Run ESLint
npm run lint:fix          # Fix linting issues

# Testing
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm test -- --coverage   # With coverage

# Database
npm run seed             # Seed with sample data

# Production
npm start                # Run server
```

## 🔗 Key Endpoints Reference

### Authentication
```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 Login user
GET    /api/auth/me                    Get current user
POST   /api/auth/api-keys              Create API key
GET    /api/auth/api-keys              List API keys
```

### Courses
```
GET    /api/courses                    List courses
POST   /api/courses                    Create course (admin)
GET    /api/courses/:id                Get course details
PUT    /api/courses/:id                Update course (admin)
POST   /api/courses/:id/enroll         Enroll in course
POST   /api/courses/:id/drop           Drop course
```

### Results/Grades
```
GET    /api/results                    List results
POST   /api/results                    Create result (faculty)
PUT    /api/results/:id                Update result (faculty)
PUT    /api/results/:id/publish        Publish results (admin)
DELETE /api/results/:id                Delete result (admin)
```

### Announcements
```
GET    /api/announcements              List announcements
POST   /api/announcements              Create announcement
PUT    /api/announcements/:id          Update announcement
DELETE /api/announcements/:id          Delete announcement
PUT    /api/announcements/:id/pin      Pin announcement (admin)
```

### Materials
```
GET    /api/courses/:id/materials      List materials
POST   /api/courses/:id/materials      Upload material
PUT    /api/materials/:id              Update material
DELETE /api/materials/:id              Delete material
GET    /api/materials/:id/download     Download material
```

### User Management
```
GET    /api/admin/users                List users (admin)
PUT    /api/admin/users/:id/role       Update user role (admin)
DELETE /api/admin/users/:id            Delete user (admin)
GET    /api/admin/statistics           Get statistics (admin)
```

### Notifications
```
GET    /api/notifications              List notifications
PUT    /api/notifications/:id/read     Mark as read
DELETE /api/notifications/:id          Delete notification
DELETE /api/notifications              Clear all
```

### Events
```
GET    /api/events                     List events
POST   /api/events                     Create event (admin)
GET    /api/events/:id                 Get event details
PUT    /api/events/:id                 Update event (admin)
POST   /api/events/:id/register        Register for event
DELETE /api/events/:id                 Delete event (admin)
```

### Enrollment & Attendance
```
GET    /api/enrollments                List enrollments
GET    /api/students/:id/enrollments   Student enrollments
GET    /api/courses/:id/enrollments    Course enrollments
POST   /api/attendance/mark            Mark attendance
GET    /api/attendance/records         Get attendance
PUT    /api/attendance/:id             Update attendance
GET    /api/courses/:id/attendance     Course attendance
```

## 🔐 Authentication

### JWT Token
```javascript
// Add to headers
Authorization: Bearer <your-jwt-token>

// Token expires in 7 days
// Create with: POST /api/auth/login
```

### API Key
```javascript
// Add to headers
X-API-Key: <your-api-key>

// Create with: POST /api/auth/api-keys
```

## 📁 File Structure Quick Guide

| Path | Purpose |
|------|---------|
| `src/models/` | Database schemas |
| `src/services/` | Business logic |
| `src/controllers/` | Request handlers |
| `src/routes/` | API endpoints |
| `src/middleware/` | Custom middleware |
| `src/utils/` | Helper functions |
| `src/config/` | Configuration |
| `tests/` | Test files |
| `docs/` | Documentation |
| `scripts/` | Utility scripts |

## 🔍 Common Tasks

### Add New Endpoint

1. **Model** (if needed): `src/models/Example.js`
2. **Service**: `src/services/exampleService.js`
3. **Controller**: `src/controllers/exampleController.js`
4. **Routes**: `src/routes/example.js`
5. **Validation**: Add to `src/utils/validation.js`
6. **Tests**: Add to `tests/example.test.js`
7. **Register**: Import and use in `src/index.js`
8. **Document**: Update `docs/API_DOCUMENTATION.md`

### Run Tests
```bash
npm test                           # All tests
npm test -- tests/auth.test.js    # Specific test
npm test -- --coverage            # With coverage
npm run test:watch                # Watch mode
```

### Check Code Quality
```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix issues
```

### Deploy
```bash
# Docker
docker-compose up -d

# Heroku
git push heroku main

# AWS/Other
Follow docs/DEPLOYMENT.md
```

## 🗄️ Database Models Quick Reference

```javascript
// User - System users
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  department: String,
  role: "student" | "faculty" | "admin",
  enrolledCourses: [Course],
  lastLogin: Date
}

// Course - Courses offered
{
  courseCode: String (unique),
  name: String,
  instructor: User,
  semester: String,
  year: Number,
  credits: Number,
  capacity: Number,
  enrolled: [User],
  prerequisites: [Course]
}

// Result - Student grades
{
  student: User,
  course: Course,
  semester: String,
  year: Number,
  marks: Number (0-100),
  grade: "A" | "B" | "C" | "D" | "F",
  isPublished: Boolean
}

// Announcement - Campus news
{
  title: String,
  content: String,
  category: String,
  author: User,
  targetRoles: ["student"] | ["faculty"] | etc,
  isPinned: Boolean,
  views: Number,
  viewedBy: [User]
}
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## 🔐 User Roles Summary

| Role | Create | Read Own | Read All | Update Own | Update All | Delete |
|------|--------|----------|----------|-----------|-----------|--------|
| **Student** | Own profile | ✅ | Own data | ✅ | ❌ | ❌ |
| **Faculty** | Announcements, Results | ✅ | Own courses | ✅ | Own items | ❌ |
| **Admin** | Everything | ✅ | Everything | ✅ | Everything | ✅ |

## 🐛 Debugging

### View Logs
```bash
# Development (nodemon)
npm run dev

# Production
npm start 2>&1 | tee app.log
```

### Database Query Logs
```javascript
// In src/index.js
mongoose.set('debug', true);
```

### Test Debugging
```bash
npm test -- --verbose
npm test -- --detectOpenHandles
```

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - No/invalid auth |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Error - Server error |

## 📝 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3001

# Database
MONGODB_URI=mongodb://localhost:27017/campus-portal

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# Email (Mailtrap)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=your-user
SMTP_PASS=your-password
SENDER_EMAIL=noreply@campusportal.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## 🔗 Important Links

- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **Testing**: `docs/TESTING.md`
- **Performance**: `docs/PERFORMANCE_TESTING.md`
- **Contributing**: `CONTRIBUTING.md`
- **Project Status**: `PROJECT_STATUS.md`

## 📦 Dependencies Summary

### Core
- express (4.18.2) - Web framework
- mongoose (8.0.0) - MongoDB ODM
- jsonwebtoken (9.1.0) - JWT
- bcryptjs (2.4.3) - Password hashing

### Validation & Security
- zod (3.22.4) - Schema validation
- helmet (7.1.0) - Security headers
- cors (2.8.5) - CORS handling
- express-rate-limit (7.1.5) - Rate limiting

### Email & Utilities
- nodemailer (6.9.7) - Email sending
- dotenv (16.3.1) - Environment config
- morgan (1.10.0) - HTTP logging
- uuid (9.0.1) - UUID generation

### Development & Testing
- nodemon (3.0.2) - Auto-reload
- jest (29.7.0) - Test framework
- supertest (6.3.3) - HTTP testing
- eslint (8.54.0) - Linting

## 🎯 Performance Tips

1. **Database Queries**
   - Use `.lean()` for read-only queries
   - Select only needed fields with `.select()`
   - Use indexes on frequently queried fields

2. **API Responses**
   - Implement pagination
   - Use caching for static data
   - Compress responses with gzip

3. **Authentication**
   - Cache JWT verification results
   - Use short-lived tokens
   - Implement token refresh mechanism

4. **Monitoring**
   - Track response times
   - Monitor error rates
   - Setup alerts for anomalies

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check `MONGODB_URI` in `.env` |
| JWT verification fails | Verify `JWT_SECRET` matches |
| Email not sending | Check Mailtrap credentials |
| Tests timeout | Increase `testTimeout` in jest.config.js |
| Port 3001 in use | Change `PORT` in `.env` |
| Linting errors | Run `npm run lint:fix` |

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: GitHub Issues
- **Contributing**: See `CONTRIBUTING.md`

---

**Last Updated**: 2024
**Version**: 1.0.0
