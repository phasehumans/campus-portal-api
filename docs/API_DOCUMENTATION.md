# Campus Portal Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Setup & Installation](#setup--installation)
9. [Deployment](#deployment)

---

## Overview

Campus Portal is a production-ready backend API for managing a campus ecosystem with Role-Based Access Control (RBAC). It supports three user roles:

- **Student**: View announcements, results, courses, and materials
- **Faculty**: Create announcements, upload materials, manage courses
- **Admin**: Full system access, user management, result publishing

### Key Features

✅ JWT + API Key authentication
✅ Comprehensive RBAC system
✅ Email notifications (Mailtrap)
✅ MongoDB with Mongoose ODM
✅ Input validation with Zod
✅ Rate limiting & security headers
✅ Modular, scalable architecture
✅ Production-ready error handling

---

## Architecture

### Project Structure

```
campus-portal/
├── src/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── ApiKey.js
│   │   ├── Announcement.js
│   │   ├── Result.js
│   │   ├── Course.js
│   │   ├── Material.js
│   │   ├── Enrollment.js
│   │   ├── Attendance.js
│   │   ├── Event.js
│   │   └── Notification.js
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── routes/              # API routes
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT & API key auth
│   │   ├── commonMiddleware.js # CORS, helmet, etc
│   │   └── errorHandler.js  # Global error handler
│   ├── utils/               # Utility functions
│   │   ├── auth.js          # JWT operations
│   │   ├── rbac.js          # RBAC rules
│   │   ├── validation.js    # Zod schemas
│   │   ├── email.js         # Email templates
│   │   └── responseHandler.js
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   └── index.js             # Application entry point
├── tests/                   # Test files
├── docs/                    # Documentation
├── package.json
├── .env.example
└── README.md
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATIONS                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Express.js Application Server (Port 5000)    │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │      Middleware Layer                       │   │  │
│  │  │  • Auth (JWT + API Key)                    │   │  │
│  │  │  • CORS & Security Headers (Helmet)        │   │  │
│  │  │  • Rate Limiting                           │   │  │
│  │  │  • Logging (Morgan)                        │   │  │
│  │  │  • Error Handling                          │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │      Routes & Controllers                   │   │  │
│  │  │  • /api/auth (Authentication)              │   │  │
│  │  │  • /api/announcements                      │   │  │
│  │  │  • /api/results                            │   │  │
│  │  │  • /api/courses                            │   │  │
│  │  │  • /api/admin (User Management)            │   │  │
│  │  │  • /api/notifications                      │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │      Services Layer                         │   │  │
│  │  │  • Business Logic                          │   │  │
│  │  │  • Database Operations                     │   │  │
│  │  │  • Email Notifications                     │   │  │
│  │  │  • RBAC Enforcement                        │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │      Data Validation Layer (Zod)           │   │  │
│  │  │  • Request validation schemas              │   │  │
│  │  │  • Type safety                             │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌────▼────┐   ┌────▼────┐  ┌────▼────┐
         │ MongoDB  │   │ Mailtrap │  │ External│
         │ Database │   │ Email    │  │Services │
         └──────────┘   └──────────┘  └─────────┘
```

---

## Authentication

### JWT Authentication

**Token Structure:**
```javascript
{
  id: "user_id",
  email: "user@example.com",
  role: "student" // or "faculty", "admin"
}
```

**Token Expiry:** 7 days (configurable via `JWT_EXPIRE`)

**Usage:**
```
Authorization: Bearer <token>
```

### API Key Authentication

**How to Generate:**
1. Login user
2. Send POST request to `/api/auth/api-key`
3. Store the returned key securely (shown only once)

**Usage:**
```
X-API-Key: <api-key>
```

### Authentication Flow

```
┌──────────────┐
│   User Input │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ Check Bearer Token or    │
│ X-API-Key Header         │
└──────┬───────────────────┘
       │
       ├─ JWT Found ──────┐
       │                  ▼
       │          ┌──────────────────┐
       │          │ Verify JWT with  │
       │          │ JWT_SECRET       │
       │          └──────┬───────────┘
       │                 │
       │                 ▼
       │          ┌──────────────────┐
       │          │ Fetch User from  │
       │          │ Database         │
       │          └──────┬───────────┘
       │                 │
       ├─ API Key Found ─┤
       │                 ▼
       │          ┌──────────────────┐
       │          │ Hash API Key &   │
       │          │ Verify in DB     │
       │          └──────┬───────────┘
       │                 │
       ▼                 ▼
┌──────────────────────────────┐
│  Authenticated & Authorized  │
│  req.user object available   │
└──────────────────────────────┘
```

---

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "department": "Computer Science",
  "phone": "+1234567890",
  "role": "student"  // optional, defaults to "student"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "student",
      "department": "Computer Science",
      ...
    }
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "User retrieved successfully",
  "data": { ... }
}
```

#### Create API Key
```
POST /api/auth/api-key
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Mobile App",
  "description": "API key for mobile application",
  "permissions": ["read", "write"]
}

Response (201):
{
  "success": true,
  "message": "API key created successfully",
  "data": {
    "id": "...",
    "key": "uuid-key-string",
    "name": "Mobile App",
    "message": "Save this key securely. You will not be able to see it again."
  }
}
```

### Announcement Endpoints

#### Create Announcement
```
POST /api/announcements
Authorization: Bearer <token>
Content-Type: application/json
Required Roles: faculty, admin

{
  "title": "Course Registration Deadline",
  "content": "The deadline for course registration is...",
  "category": "academic",  // academic | event | maintenance | general | urgent
  "targetRoles": ["student", "faculty"],
  "isPinned": true
}

Response (201): Announcement object
```

#### Get All Announcements
```
GET /api/announcements?page=1&limit=20
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "data": {
    "announcements": [ ... ],
    "pagination": {
      "total": 50,
      "pages": 3,
      "currentPage": 1,
      "limit": 20
    }
  }
}
```

#### Get Announcement by ID
```
GET /api/announcements/:id
Authorization: Bearer <token>

Response (200): Announcement object
```

#### Update Announcement
```
PUT /api/announcements/:id
Authorization: Bearer <token>
Required Roles: faculty, admin (owner or admin)

Response (200): Updated announcement
```

#### Delete Announcement
```
DELETE /api/announcements/:id
Authorization: Bearer <token>
Required Roles: faculty, admin (owner or admin)

Response (200): Success message
```

### Results Endpoints

#### Create Result (Admin Only)
```
POST /api/results
Authorization: Bearer <token>
Required Roles: admin

{
  "student": "student_id",
  "course": "course_id",
  "marks": 85,
  "grade": "A",
  "semester": "Fall",
  "year": 2024,
  "remarks": "Excellent performance"
}

Response (201): Result object
```

#### Get Results
```
GET /api/results?page=1&limit=20
Authorization: Bearer <token>

Behavior by role:
- Student: Only own results
- Faculty: Results for students in their courses
- Admin: All results

Response (200): Results with pagination
```

#### Get Student Results
```
GET /api/results/:studentId
Authorization: Bearer <token>

Response (200): Array of student results
```

#### Publish Results (Admin Only)
```
POST /api/results/publish
Authorization: Bearer <token>
Required Roles: admin

{
  "resultIds": ["id1", "id2", "id3"]
}

Response (200): Success message
```

### Course Endpoints

#### Create Course (Admin Only)
```
POST /api/courses
Authorization: Bearer <token>
Required Roles: admin

{
  "courseCode": "CS101",
  "title": "Introduction to Computer Science",
  "description": "...",
  "credits": 3,
  "instructor": "faculty_id",
  "department": "Computer Science",
  "semester": "Fall",
  "year": 2024,
  "maxStudents": 50,
  "schedule": {
    "days": ["Monday", "Wednesday", "Friday"],
    "time": "10:00-11:30",
    "location": "Building A, Room 101"
  }
}

Response (201): Course object
```

#### Get All Courses
```
GET /api/courses?page=1&limit=20&department=CS&semester=Fall
Authorization: Bearer <token>

Response (200): Courses with pagination
```

#### Enroll Student
```
POST /api/courses/:courseId/enroll
Authorization: Bearer <token>

Response (201): Enrollment object
```

#### Drop Course
```
DELETE /api/courses/:courseId/drop
Authorization: Bearer <token>

Response (200): Success message
```

### Material Endpoints

#### Upload Material
```
POST /api/courses/:courseId/materials
Authorization: Bearer <token>
Required Roles: faculty, admin

{
  "title": "Lecture 1 - Introduction",
  "description": "First lecture slides",
  "type": "lecture",  // lecture | assignment | reading | video | document | other
  "fileName": "lecture-1.pdf",
  "fileSize": 2048576,
  "fileUrl": "/uploads/lecture-1.pdf",
  "dueDate": "2024-12-31T23:59:59Z"
}

Response (201): Material object
```

#### Get Course Materials
```
GET /api/courses/:courseId/materials?page=1&limit=20
Authorization: Bearer <token>

Response (200): Materials with pagination
```

#### Download Material
```
GET /api/courses/:courseId/materials/:materialId/download
Authorization: Bearer <token>

Response (200): Download URL
```

### Admin Endpoints

#### Get All Users
```
GET /api/admin/users?page=1&limit=20&role=student&department=CS
Authorization: Bearer <token>
Required Roles: admin

Response (200): Users with pagination
```

#### Update User Role
```
PUT /api/admin/users/:id/role
Authorization: Bearer <token>
Required Roles: admin

{
  "role": "faculty"  // student | faculty | admin
}

Response (200): Updated user
```

#### Deactivate User
```
PUT /api/admin/users/:id/deactivate
Authorization: Bearer <token>
Required Roles: admin

Response (200): Updated user
```

#### Get Statistics
```
GET /api/admin/stats
Authorization: Bearer <token>
Required Roles: admin

Response (200):
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 950,
      "byRole": {
        "student": 800,
        "faculty": 150,
        "admin": 50
      }
    },
    "courses": {
      "total": 100,
      "active": 95
    },
    "enrollments": {
      "total": 5000
    }
  }
}
```

### Notification Endpoints

#### Get Notifications
```
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>

Response (200): Notifications with unread count
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Authorization: Bearer <token>

Response (200): Updated notification
```

#### Mark All as Read
```
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>

Response (200): Success message
```

---

## User Roles & Permissions

### Student Role
| Resource | View | Create | Update | Delete |
|----------|------|--------|--------|--------|
| Announcements | ✅ | ❌ | ❌ | ❌ |
| Own Results | ✅ | ❌ | ❌ | ❌ |
| Other Results | ❌ | ❌ | ❌ | ❌ |
| Courses | ✅ | ❌ | ❌ | ❌ |
| Materials | ✅ | ❌ | ❌ | ❌ |
| Own Profile | ✅ | ❌ | ✅ | ❌ |
| Enrollments | ✅ | ✅ | ❌ | ✅ |

### Faculty Role
| Resource | View | Create | Update | Delete |
|----------|------|--------|--------|--------|
| Announcements | ✅ | ✅ | ✅* | ✅* |
| Own Results | ✅ | ❌ | ❌ | ❌ |
| Course Results | ✅ | ❌ | ❌ | ❌ |
| Courses | ✅ | ❌ | ❌ | ❌ |
| Own Course Materials | ✅ | ✅ | ✅ | ✅ |
| Other Materials | ✅ | ❌ | ❌ | ❌ |
| Own Profile | ✅ | ❌ | ✅ | ❌ |

### Admin Role
| Resource | View | Create | Update | Delete |
|----------|------|--------|--------|--------|
| Everything | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ✅ | ✅ | ✅ |
| System Stats | ✅ | ❌ | ❌ | ❌ |

*Owner or Admin only

---

## Data Models

### User Schema
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (student | faculty | admin, default: student),
  department: String (required),
  phone: String,
  avatar: String,
  bio: String,
  enrolledCourses: [ObjectId],
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Course Schema
```javascript
{
  courseCode: String (required, unique),
  title: String (required),
  description: String,
  credits: Number (required),
  instructor: ObjectId (ref: User, required),
  department: String (required),
  semester: String (Fall | Spring | Summer),
  year: Number (required),
  schedule: {
    days: [String],
    time: String,
    location: String
  },
  maxStudents: Number (required),
  enrolledStudents: [ObjectId],
  prerequisites: [ObjectId],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Result Schema
```javascript
{
  student: ObjectId (ref: User, required),
  course: ObjectId (ref: Course, required),
  marks: Number (0-100, required),
  grade: String (A+ | A | ... | F, required),
  semester: String (Fall | Spring | Summer),
  year: Number (required),
  remarks: String,
  isPublished: Boolean (default: false),
  publishedAt: Date,
  publishedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Announcement Schema
```javascript
{
  title: String (required),
  content: String (required),
  author: ObjectId (ref: User, required),
  category: String (academic | event | maintenance | general | urgent),
  targetRoles: [String],
  attachments: [{ filename, url, size, uploadedAt }],
  isPinned: Boolean (default: false),
  isPublished: Boolean (default: true),
  views: [{ user, viewedAt }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "details": ["Field error 1", "Field error 2"]
  },
  "timestamp": "2024-11-13T10:30:00.000Z"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (auth error)
- `403` - Forbidden (permission error)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### Common Errors
| Error | Code | Resolution |
|-------|------|-----------|
| Invalid JWT | 401 | Refresh token or login again |
| Expired Token | 401 | Refresh token or login again |
| Missing API Key | 401 | Provide X-API-Key header |
| Invalid API Key | 401 | Check key validity and expiry |
| Insufficient Permissions | 403 | Use account with proper role |
| Validation Failed | 400 | Check request data against schema |
| Rate Limit Exceeded | 429 | Wait before retrying |

---

## Setup & Installation

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm or yarn

### Installation Steps

1. **Clone Repository**
```bash
git clone <repo-url>
cd campus-portal
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/campus-portal
JWT_SECRET=your_secret_key_here
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_USER=your_mailtrap_user
SMTP_PASSWORD=your_mailtrap_password
```

4. **Start MongoDB**
```bash
# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or local MongoDB service
mongod
```

5. **Start Development Server**
```bash
npm run dev
```

Server will be available at `http://localhost:5000`

### Running Tests
```bash
npm test
npm run test:watch
```

### Production Build
```bash
NODE_ENV=production npm start
```

---

## Deployment

### Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/campus-portal
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - mongo

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

3. **Deploy**
```bash
docker-compose up -d
```

### Cloud Deployment (Heroku Example)

1. **Install Heroku CLI**
2. **Login & Create App**
```bash
heroku login
heroku create campus-portal-api
```

3. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri
```

4. **Deploy**
```bash
git push heroku main
```

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Get connection string
3. Set `MONGODB_URI` in environment variables
4. Whitelist your IP address

---

## Testing

### Test Structure
```
tests/
├── unit/
│   ├── authService.test.js
│   ├── announcementService.test.js
│   └── ...
├── integration/
│   ├── auth.test.js
│   ├── announcements.test.js
│   └── ...
└── fixtures/
    └── testData.js
```

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

---

## Support & Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Solution: Ensure MongoDB is running and MONGODB_URI is correct
```

**JWT Token Invalid**
```
Solution: Clear old tokens, login again, ensure JWT_SECRET is set
```

**Email Not Sending**
```
Solution: Verify Mailtrap credentials and SMTP settings
```

**Rate Limit Exceeded**
```
Solution: Wait for rate limit window to reset (default 15 min)
```

For more support, refer to the GitHub issues or contact the development team.

---

**Last Updated:** November 13, 2024
**Version:** 1.0.0
