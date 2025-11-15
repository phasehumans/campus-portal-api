# Campus Portal API

REST API for a campus management system with Role-Based Access Control (RBAC), featuring JWT authentication, API keys, email notifications, and comprehensive course management.

## Core Features
- **JWT Authentication** - Secure token-based authentication with 7-day expiration
- **API Key Management** - Generate and manage API keys for programmatic access
- **RBAC System** - Three role types: Student, Faculty, Admin
- **Course Management** - Full CRUD operations for courses with prerequisites
- **Student Enrollment** - Course enrollment, dropping, and status tracking
- **Results Publishing** - Admin-controlled result publication with automatic notifications
- **Announcements** - Role-based announcement system with pinning and view tracking
- **Course Materials** - Faculty can upload and manage learning materials with downloads
- **Email Notifications** - Integrated with Mailtrap for email delivery
- **Events Management** - Campus events with registration and capacity management
- **Attendance Tracking** - Track student attendance with status (present/absent/late/excused)
- **Input Validation** - Zod for comprehensive request validation
- **Rate Limiting** - Protect API from abuse with configurable limits
- **Security Headers** - Helmet.js integration and bcryptjs password hashing

## Project Structure

```
campus-portal-api/
├── src/                            # Main application code
│   ├── index.js                    # Express app entry point
│   ├── config/
│   │   └── database.js             # MongoDB connection & initialization
│   │
│   ├── models/                     # Mongoose schemas (10 models)
│   │   ├── User.js                 # Users with authentication & roles
│   │   ├── Course.js               # Courses with enrollment tracking
│   │   ├── Result.js               # Student grades with calculations
│   │   ├── Announcement.js         # Campus announcements
│   │   ├── Material.js             # Course learning materials
│   │   ├── ApiKey.js               # API key management
│   │   ├── Notification.js         # In-app notifications
│   │   ├── Event.js                # Campus events
│   │   ├── Enrollment.js           # Course enrollments
│   │   └── Attendance.js           # Attendance records
│   │
│   ├── services/                   # Business logic (10 services)
│   │   ├── authService.js          # Authentication & API keys
│   │   ├── courseService.js        # Course operations
│   │   ├── resultService.js        # Grade management
│   │   ├── announcementService.js  # Announcements
│   │   ├── materialService.js      # Material handling
│   │   ├── notificationService.js  # Notifications
│   │   ├── adminService.js         # Admin operations
│   │   ├── eventService.js         # Event management
│   │   ├── enrollmentService.js    # Enrollment tracking
│   │   └── attendanceService.js    # Attendance operations
│   │
│   ├── controllers/                # Request handlers (10 controllers)
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── resultController.js
│   │   ├── announcementController.js
│   │   ├── materialController.js
│   │   ├── notificationController.js
│   │   ├── adminController.js
│   │   ├── eventController.js
│   │   ├── enrollmentController.js
│   │   └── attendanceController.js
│   │
│   ├── routes/                     # API routes (9 route files)
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── courses.js              # Course endpoints
│   │   ├── results.js              # Result endpoints
│   │   ├── announcements.js        # Announcement endpoints
│   │   ├── notifications.js        # Notification endpoints
│   │   ├── admin.js                # Admin endpoints
│   │   ├── events.js               # Event endpoints
│   │   ├── enrollments.js          # Enrollment endpoints
│   │   └── attendance.js           # Attendance endpoints
│   │
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js                 # JWT & API Key authentication
│   │   ├── errorHandler.js         # Global error handling
│   │   └── commonMiddleware.js     # CORS, Helmet, Rate limiting
│   │
│   └── utils/                      # Utility functions
│       ├── auth.js                 # JWT operations
│       ├── rbac.js                 # Role-based access control
│       ├── validation.js           # Zod validation schemas
│       ├── email.js                # Email templates & Mailtrap
│       └── responseHandler.js      # Standard response formatting
│
├── tests/                          # Test suite (6 files, 41 test cases)
│   ├── setup.js                    # Jest configuration
│   ├── auth.test.js                # Authentication tests
│   ├── courseService.test.js       # Course service tests
│   ├── resultService.test.js       # Result service tests
│   ├── announcementService.test.js # Announcement tests
│   └── routes.integration.test.js  # Integration tests
│
├── package.json                    # Dependencies & scripts
├── jest.config.js                  # Test configuration
├── .env.example                    # Environment template
├── .env.test                       # Test environment
└── .gitignore                      # Git ignore patterns
├── postman-collection.json         # Postman API collection
├── README.md                       # This file
└── CONTRIBUTING.md                 # Development guidelines
```


## API Endpoints

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
