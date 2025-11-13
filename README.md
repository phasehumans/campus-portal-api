# Campus Portal Backend API

A production-ready backend API for a campus management system with Role-Based Access Control (RBAC), featuring JWT authentication, API keys, email notifications, and comprehensive course management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [User Roles](#user-roles)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Core Features
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **API Key Management** - Generate and manage API keys for programmatic access
- ✅ **RBAC System** - Three role types: Student, Faculty, Admin
- ✅ **Course Management** - Full CRUD operations for courses
- ✅ **Student Enrollment** - Easy course enrollment and management
- ✅ **Results Publishing** - Admin-controlled result publication with notifications
- ✅ **Announcements** - Role-based announcement system
- ✅ **Course Materials** - Faculty can upload and manage learning materials
- ✅ **Email Notifications** - Integrated with Mailtrap for email delivery
- ✅ **Input Validation** - Zod for comprehensive request validation
- ✅ **Rate Limiting** - Protect API from abuse
- ✅ **Security Headers** - Helmet.js integration

### Bonus Features
- 📢 **Event Management** - Create and manage campus events
- 📝 **Attendance Tracking** - Record and monitor student attendance
- 👥 **Enrollment Statistics** - Track course enrollment metrics
- 🔔 **Notifications** - Real-time notification system

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js >= 16.0.0
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB 4.4+ with Mongoose 8.0.0
- **Authentication:** JWT (jsonwebtoken 9.1.0)
- **Password Hashing:** bcryptjs 2.4.3
- **Validation:** Zod 3.22.4
- **Email:** Nodemailer 6.9.7 (with Mailtrap)
- **Security:** Helmet 7.1.0, CORS, Express Rate Limit
- **Logging:** Morgan 1.10.0

### Development
- **Package Manager:** npm
- **Testing:** Jest 29.7.0, Supertest 6.3.3
- **Linting:** ESLint 8.54.0
- **Process Management:** Nodemon 3.0.2
- **Environment:** dotenv 16.3.1

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd campus-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment**
   Edit `.env` with your settings:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/campus-portal
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration (Mailtrap)
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your_mailtrap_username
   SMTP_PASSWORD=your_mailtrap_password
   MAIL_FROM=noreply@campusportal.com
   ```

5. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or local MongoDB
   mongod
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Server will be running at `http://localhost:5000`

7. **Verify the server is running**
   ```bash
   curl http://localhost:5000/health
   ```

---

## 📁 Project Structure

```
campus-portal/
├── src/
│   ├── config/
│   │   └── database.js              # MongoDB connection
│   ├── controllers/                 # Request handlers
│   │   ├── authController.js
│   │   ├── announcementController.js
│   │   ├── courseController.js
│   │   ├── resultController.js
│   │   ├── adminController.js
│   │   ├── materialController.js
│   │   ├── notificationController.js
│   │   ├── eventController.js
│   │   ├── enrollmentController.js
│   │   └── attendanceController.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT & API Key authentication
│   │   ├── commonMiddleware.js      # CORS, helmet, rate limiting
│   │   └── errorHandler.js          # Global error handling
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   ├── ApiKey.js
│   │   ├── Course.js
│   │   ├── Announcement.js
│   │   ├── Result.js
│   │   ├── Material.js
│   │   ├── Enrollment.js
│   │   ├── Event.js
│   │   ├── Attendance.js
│   │   └── Notification.js
│   ├── routes/                      # API routes
│   │   ├── auth.js
│   │   ├── announcements.js
│   │   ├── courses.js
│   │   ├── results.js
│   │   ├── admin.js
│   │   ├── notifications.js
│   │   ├── events.js
│   │   ├── enrollments.js
│   │   └── attendance.js
│   ├── services/                    # Business logic
│   │   ├── authService.js
│   │   ├── announcementService.js
│   │   ├── courseService.js
│   │   ├── resultService.js
│   │   ├── materialService.js
│   │   ├── adminService.js
│   │   ├── notificationService.js
│   │   ├── eventService.js
│   │   ├── enrollmentService.js
│   │   └── attendanceService.js
│   ├── utils/
│   │   ├── auth.js                  # JWT operations
│   │   ├── rbac.js                  # RBAC rules & logic
│   │   ├── validation.js            # Zod schemas
│   │   ├── email.js                 # Email templates
│   │   └── responseHandler.js       # Response formatting
│   └── index.js                     # Application entry point
├── tests/                           # Test files
├── docs/                            # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── Campus-Portal-Postman.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/api-key` - Create API key
- `GET /auth/api-keys` - List API keys
- `DELETE /auth/api-keys/:keyId` - Revoke API key

### Announcements
- `POST /announcements` - Create (Faculty/Admin)
- `GET /announcements` - Get all (all roles)
- `GET /announcements/:id` - Get one (all roles)
- `PUT /announcements/:id` - Update (Faculty/Admin)
- `DELETE /announcements/:id` - Delete (Faculty/Admin)

### Courses
- `POST /courses` - Create (Admin only)
- `GET /courses` - Get all (all roles)
- `GET /courses/:id` - Get one (all roles)
- `POST /courses/:courseId/enroll` - Enroll (Students)
- `DELETE /courses/:courseId/drop` - Drop (Students)
- `PUT /courses/:id` - Update (Admin)
- `DELETE /courses/:id` - Delete (Admin)

### Course Materials
- `POST /courses/:courseId/materials` - Upload (Faculty/Admin)
- `GET /courses/:courseId/materials` - List (all roles)
- `GET /courses/:courseId/materials/:materialId` - Get one (all roles)
- `PUT /courses/:courseId/materials/:materialId` - Update (Faculty/Admin)
- `DELETE /courses/:courseId/materials/:materialId` - Delete (Faculty/Admin)
- `GET /courses/:courseId/materials/:materialId/download` - Download (all roles)

### Results
- `POST /results` - Create (Admin only)
- `GET /results` - Get results (role-based)
- `GET /results/:studentId` - Get student results (role-based)
- `POST /results/publish` - Publish results (Admin)
- `PUT /results/:id` - Update (Admin)
- `DELETE /results/:id` - Delete (Admin)

### Events
- `POST /events` - Create (Admin/Faculty)
- `GET /events` - Get all (all roles)
- `GET /events/:id` - Get one (all roles)
- `POST /events/:id/register` - Register (all roles)
- `DELETE /events/:id/register` - Unregister (all roles)
- `PUT /events/:id` - Update (Admin/Faculty)
- `DELETE /events/:id` - Delete (Admin)

### Admin Routes (Admin only)
- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id/role` - Update user role
- `PUT /admin/users/:id/deactivate` - Deactivate user
- `PUT /admin/users/:id/activate` - Activate user
- `GET /admin/stats` - Get system statistics

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/:id/read` - Mark as read
- `PUT /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

---

## 👥 User Roles

### Student
- View announcements
- View available courses
- Enroll/drop courses
- View own results (when published)
- Download course materials
- View and manage notifications
- Register for events

### Faculty
- Create and manage announcements
- Upload and manage course materials
- View course enrollments
- View student results for their courses
- Mark and manage student attendance
- Create and manage events
- View notifications

### Admin
- Full system access
- Manage all users (create, delete, change roles)
- Publish results for all students
- Create and manage all courses
- Create and manage announcements
- View system statistics
- Access administration panel

---

## ⚙️ Configuration

### Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug

# Database
MONGODB_URI=mongodb://localhost:27017/campus-portal
MONGODB_TEST_URI=mongodb://localhost:27017/campus-portal-test

# JWT
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Email (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_username
SMTP_PASSWORD=your_password
MAIL_FROM=noreply@campusportal.com
MAIL_FROM_NAME=Campus Portal

# API
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Indexes

The application automatically creates indexes for:
- User email (unique)
- Course code (unique)
- Result uniqueness (student + course + semester + year)
- Enrollment uniqueness (student + course)
- Attendance uniqueness (student + course + date)

---

## 🚢 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for comprehensive deployment guides including:
- Docker containerization
- Docker Compose setup
- Heroku deployment
- AWS deployment
- MongoDB Atlas setup
- Environment configuration for production

### Quick Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

### Example Test
```javascript
describe('Auth Service', () => {
  it('should register a user', async () => {
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'password123',
      department: 'CS'
    };
    
    const user = await authService.registerUser(userData);
    expect(user.email).toBe('john@test.com');
    expect(user.role).toBe('student');
  });
});
```

---

## 📚 Documentation

### Available Documentation
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[Architecture Guide](docs/ARCHITECTURE.md)** - System design, diagrams, and workflows
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Postman Collection](docs/Campus-Portal-Postman.json)** - Import into Postman for API testing

### API Documentation Highlights
- Detailed endpoint specifications
- Request/response examples
- Authentication methods
- Error handling
- Data models

### Architecture Highlights
- System architecture diagrams
- Database schema with ERD
- User workflows for each role
- Security model
- Scalability considerations

---

## 🔍 Key Features Explanation

### JWT Authentication Flow
```
1. User logs in with credentials
2. Server validates and creates JWT token
3. Client stores token
4. Client sends token in Authorization header
5. Server verifies token on each request
6. Token expires after 7 days (configurable)
```

### API Key Authentication
```
1. Authenticated user creates API key
2. System generates unique key
3. Key is hashed and stored
4. Client can use key in X-API-Key header
5. Ideal for mobile apps and third-party integrations
```

### RBAC (Role-Based Access Control)
- Student: Limited access to own resources
- Faculty: Extended access to manage courses
- Admin: Full system access
- Permission checks at middleware and service level

### Email Notifications
- Results published → Student email notification
- New announcement → Role-based email notification
- Event created → User email notification
- Enrollment confirmation → Student email

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Problem:** `MongoDB connection error`
**Solution:** Ensure MongoDB is running and `MONGODB_URI` is correct

### JWT Token Invalid
**Problem:** `Invalid JWT token`
**Solution:** 
- Token may have expired (7 days)
- Re-login to get new token
- Check JWT_SECRET is set correctly

### Email Not Sending
**Problem:** `Email send error`
**Solution:**
- Verify Mailtrap credentials
- Check SMTP settings
- Test with `npm run test:email`

### Rate Limit Exceeded
**Problem:** `Too many requests`
**Solution:** Wait 15 minutes or restart server

### Port Already in Use
**Problem:** `Port 5000 already in use`
**Solution:** Change PORT in .env or kill process on that port

---

## 📞 Support

For issues and questions:
1. Check the [documentation](docs/)
2. Review [API Documentation](docs/API_DOCUMENTATION.md)
3. Check [Troubleshooting](#troubleshooting) section
4. Review error logs in console

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

Campus Portal Backend - A production-ready RBAC system for campus management

---

**Last Updated:** November 13, 2024
**Version:** 1.0.0
