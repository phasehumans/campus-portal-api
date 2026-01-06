# Campus Portal API

REST API for a campus management system with Role-Based Access Control (RBAC), featuring JWT authentication, API keys, email notifications and comprehensive course management

- **JWT Authentication & API Keys** - Secure token-based authentication with 7-day expiration
- **RBAC System** - Three role types: Student, Faculty, Admin with permission-based access
- **Course Management** - Create, manage and enroll students with prerequisites
- **Results Publishing** - Admin-controlled grade management with email notifications
- **Announcements & Materials** - Faculty can post announcements and upload learning materials
- **Attendance & Events** - Track attendance and manage campus events with registration
- **Email Notifications** - Integrated with Mailtrap for real-time alerts
- **Security** - bcryptjs password hashing, Helmet.js headers, rate limiting, Zod validation

## Project Structure

```
campus-portal-api/
├── src/
│   ├── index.js                    # Express app entry point
│   ├── config/database.js          # MongoDB connection
│   ├── models/                     # Mongoose schemas
│   ├── controllers/                # Request handlers
│   ├── routes/                     # API routes
│   ├── middleware/                 # Auth, error handling, CORS
│   └── utils/                      # Auth, RBAC, validation, email
├── tests/                          # Jest test
├── .env.example
├── .gitignore
├── jest.config.js
├── package-lock.json
├── package.json
└── README.md                       
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
- `POST /announcements` - Create (faculty/admin)
- `GET /announcements` - Get all (all roles)
- `GET /announcements/:id` - Get one (all roles)
- `PUT /announcements/:id` - Update (faculty/admin)
- `DELETE /announcements/:id` - Delete (faculty/admin)

### Courses
- `POST /courses` - Create (admin only)
- `GET /courses` - Get all (all roles)
- `GET /courses/:id` - Get one (all roles)
- `POST /courses/:courseId/enroll` - Enroll (students)
- `DELETE /courses/:courseId/drop` - Drop (students)
- `PUT /courses/:id` - Update (admin)
- `DELETE /courses/:id` - Delete (admin)

### Course Materials
- `POST /courses/:courseId/materials` - Upload (faculty/admin)
- `GET /courses/:courseId/materials` - List (all roles)
- `GET /courses/:courseId/materials/:materialId` - Get one (all roles)
- `PUT /courses/:courseId/materials/:materialId` - Update (faculty/admin)
- `DELETE /courses/:courseId/materials/:materialId` - Delete (faculty/admin)
- `GET /courses/:courseId/materials/:materialId/download` - Download (all roles)

### Results
- `POST /results` - Create (admin only)
- `GET /results` - Get results (role-based)
- `GET /results/:studentId` - Get student results (role-based)
- `POST /results/publish` - Publish results (admin)
- `PUT /results/:id` - Update (admin)
- `DELETE /results/:id` - Delete (admin)

### Events
- `POST /events` - Create (admin/faculty)
- `GET /events` - Get all (all roles)
- `GET /events/:id` - Get one (all roles)
- `POST /events/:id/register` - Register (all roles)
- `DELETE /events/:id/register` - Unregister (all roles)
- `PUT /events/:id` - Update (admin/faculty)
- `DELETE /events/:id` - Delete (admin)

### Admin Routes
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


## User Workflows

### Student Workflow

```
┌─────────────────────────────────────┐
│        STUDENT USER FLOW            │
└─────────────────────────────────────┘

1. REGISTRATION & LOGIN
   ┌────────────────────────────────┐
   │ 1. Register with email         │
   │ 2. Password hashing (bcrypt)   │
   │ 3. Email verification          │
   │ 4. Login with credentials      │
   │ 5. Receive JWT token           │
   └────────────────────────────────┘
                 │
                 ▼
2. COURSE ENROLLMENT
   ┌────────────────────────────────┐
   │ 1. View available courses      │
   │ 2. Check prerequisites         │
   │ 3. Enroll in course            │
   │ 4. Get confirmation email      │
   │ 5. Access course materials     │
   └────────────────────────────────┘
                 │
                 ▼
3. LEARNING & MATERIAL ACCESS
   ┌────────────────────────────────┐
   │ 1. View announcements          │
   │ 2. Download course materials   │
   │ 3. Submit assignments          │
   │ 4. Track progress              │
   │ 5. View attendance record      │
   └────────────────────────────────┘
                 │
                 ▼
4. RESULT CHECKING
   ┌────────────────────────────────┐
   │ 1. Check published results     │
   │ 2. View grades & marks         │
   │ 3. Get notification on publish │
   │ 4. Download transcript         │
   │ 5. Review GPA                  │
   └────────────────────────────────┘
                 │
                 ▼
5. NOTIFICATION MANAGEMENT
   ┌────────────────────────────────┐
   │ 1. Receive system notifications│
   │ 2. Mark as read                │
   │ 3. Delete notifications        │
   │ 4. Filter by type              │
   │ 5. Subscribe to events         │
   └────────────────────────────────┘
```

### Faculty Workflow

```
┌──────────────────────────────────────┐
│        FACULTY USER FLOW             │
└──────────────────────────────────────┘

1. SETUP & AUTHENTICATION
   ┌─────────────────────────────────┐
   │ 1. Register/Login               │
   │ 2. Set department & profile     │
   │ 3. Generate API key             │
   │ 4. Configure notifications      │
   └─────────────────────────────────┘
                 │
                 ▼
2. COURSE MANAGEMENT
   ┌─────────────────────────────────┐
   │ 1. View assigned courses        │
   │ 2. View enrolled students       │
   │ 3. Update course details        │
   │ 4. Set schedules & location     │
   │ 5. Manage prerequisites         │
   └─────────────────────────────────┘
                 │
                 ▼
3. MATERIAL UPLOAD & MANAGEMENT
   ┌─────────────────────────────────┐
   │ 1. Upload lecture notes         │
   │ 2. Post assignments             │
   │ 3. Share reading materials      │
   │ 4. Upload video links           │
   │ 5. Set due dates                │
   │ 6. Track downloads              │
   └─────────────────────────────────┘
                 │
                 ▼
4. ANNOUNCEMENTS & COMMUNICATION
   ┌─────────────────────────────────┐
   │ 1. Create announcements         │
   │ 2. Target specific roles        │
   │ 3. Pin important news           │
   │ 4. Categorize announcements     │
   │ 5. Attach files                 │
   │ 6. Track views                  │
   └─────────────────────────────────┘
                 │
                 ▼
5. RESULT & ATTENDANCE MANAGEMENT
   ┌─────────────────────────────────┐
   │ 1. View student results         │
   │ 2. Mark attendance              │
   │ 3. Track attendance percentage  │
   │ 4. Generate reports             │
   │ 5. Export data                  │
   └─────────────────────────────────┘
                 │
                 ▼
6. STUDENT INTERACTION
   ┌─────────────────────────────────┐
   │ 1. View student profiles        │
   │ 2. Check enrollment             │
   │ 3. Send messages                │
   │ 4. Grade submissions            │
   │ 5. Provide feedback             │
   └─────────────────────────────────┘
```

### Admin Workflow

```
┌──────────────────────────────────────┐
│         ADMIN USER FLOW              │
└──────────────────────────────────────┘

1. SYSTEM SETUP
   ┌─────────────────────────────────┐
   │ 1. Configure system settings    │
   │ 2. Set up database              │
   │ 3. Configure email templates    │
   │ 4. Set rate limits              │
   │ 5. Configure security           │
   └─────────────────────────────────┘
                 │
                 ▼
2. USER MANAGEMENT
   ┌─────────────────────────────────┐
   │ 1. Create/manage users          │
   │ 2. Assign roles                 │
   │ 3. Activate/deactivate users    │
   │ 4. Reset passwords              │
   │ 5. Manage permissions           │
   │ 6. View user activity logs      │
   └─────────────────────────────────┘
                 │
                 ▼
3. COURSE ADMINISTRATION
   ┌─────────────────────────────────┐
   │ 1. Create/manage courses        │
   │ 2. Assign instructors           │
   │ 3. Set capacities               │
   │ 4. Archive old courses          │
   │ 5. Manage departments           │
   │ 6. Configure academic calendar  │
   └─────────────────────────────────┘
                 │
                 ▼
4. RESULT PUBLISHING
   ┌─────────────────────────────────┐
   │ 1. Enter student marks          │
   │ 2. Auto-calculate grades        │
   │ 3. Review & verify              │
   │ 4. Bulk publish results         │
   │ 5. Send notifications           │
   │ 6. Generate transcripts         │
   └─────────────────────────────────┘
                 │
                 ▼
5. SYSTEM MONITORING & ANALYTICS
   ┌─────────────────────────────────┐
   │ 1. View system statistics       │
   │ 2. Monitor performance          │
   │ 3. View API usage               │
   │ 4. Check error rates            │
   │ 5. Analyze user patterns        │
   │ 6. Generate reports             │
   └─────────────────────────────────┘
                 │
                 ▼
6. SECURITY & COMPLIANCE
   ┌─────────────────────────────────┐
   │ 1. Manage API keys              │
   │ 2. Review audit logs            │
   │ 3. Configure backups            │
   │ 4. Manage SSL certificates      │
   │ 5. Configure access policies    │
   │ 6. Monitor suspicious activity  │
   └─────────────────────────────────┘
```
### RBAC Authorization

```
                User Makes Request
                        │
                        ▼
            ┌───────────────────────┐
            │   Check req.role      │
            └───────┬───────────────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
         ▼          ▼          ▼
    Student?   Faculty?   Admin?
         │          │          │
    Can do:     Can do:    Can do:
    • View own  • Create   • Everything
      announcements announcements
    • View own  • Upload
      results     materials
    • Enroll    • View
    • Download  student
      materials  results
```