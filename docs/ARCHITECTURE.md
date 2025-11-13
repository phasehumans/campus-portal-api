# Campus Portal - Architecture & User Flow Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [User Workflows](#user-workflows)
4. [Security Model](#security-model)
5. [Scalability Considerations](#scalability-considerations)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT TIER                                   │
│  (Web App, Mobile App, Desktop Client)                          │
└────────────┬────────────────────────────────────────────────────┘
             │ HTTP/HTTPS
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API TIER (Express.js)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Request Processing Pipeline:                                  │
│  1. CORS & Security Headers (Helmet)                           │
│  2. Rate Limiting Middleware                                   │
│  3. Request Logging (Morgan)                                   │
│  4. Authentication (JWT/API Key)                               │
│  5. RBAC Authorization                                         │
│  6. Route Handler                                              │
│  7. Service Layer (Business Logic)                             │
│  8. Database Operations                                        │
│  9. Email Notifications                                        │
│  10. Response Formatting                                        │
│  11. Error Handling                                             │
│                                                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ├──────────────────┬──────────────────┬────────────────┐
             │                  │                  │                │
             ▼                  ▼                  ▼                ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  ┌──────────┐
    │   MongoDB    │   │   Mailtrap   │   │   File Store │  │ External │
    │   Database   │   │   Email SVC  │   │   (S3/Local) │  │  Services│
    └──────────────┘   └──────────────┘   └──────────────┘  └──────────┘
```

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  • REST API Endpoints                                        │
│  • Route Handlers                                            │
│  • Request/Response Formatting                               │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
│  • Services (AuthService, AnnouncementService, etc)         │
│  • Validation (Zod Schemas)                                 │
│  • RBAC Enforcement                                         │
│  • Email Notification Logic                                 │
│  • Data Transformation                                      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│  • Mongoose Models                                           │
│  • Database Queries                                          │
│  • Schema Validation                                         │
│  • Indexes & Optimization                                   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  • MongoDB Connection                                        │
│  • Connection Pooling                                        │
│  • Query Execution                                           │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
     Client Request
            │
            ▼
    ┌─────────────────┐
    │ CORS & Security │
    └────────┬────────┘
             │
            ▼
    ┌──────────────────┐
    │ Rate Limiting    │
    └────────┬─────────┘
             │
            ▼
    ┌──────────────────┐
    │ Body Parsing     │
    │ & Logging        │
    └────────┬─────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Authentication (JWT/API) │ ◄─── Check Headers
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ RBAC Authorization       │ ◄─── Verify Permissions
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Route Handler/Controller │
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Input Validation (Zod)   │
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Service Business Logic   │
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Database Operations      │
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Email Notifications      │ ◄─── Async via Mailtrap
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Format Response          │
    └────────┬─────────────────┘
             │
            ▼
    ┌──────────────────────────┐
    │ Error Handler (if error) │
    └────────┬─────────────────┘
             │
            ▼
         Response
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
├─────────────────────────────────────────────────────────────┤
│ _id (PK)                                                    │
│ firstName                                                   │
│ lastName                                                    │
│ email (UNIQUE)                                              │
│ password (hashed)                                           │
│ role (student | faculty | admin)                            │
│ department                                                  │
│ enrolledCourses[] (FK to Course)                           │
│ isActive                                                    │
│ createdAt, updatedAt                                        │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         │              │              │
    1:N  │          1:N │          1:N │
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐  ┌──────────────┐  ┌────────────┐
    │COURSE   │  │ANNOUNCEMENT  │  │RESULT      │
    ├─────────┤  ├──────────────┤  ├────────────┤
    │_id      │  │_id           │  │_id         │
    │code     │  │title         │  │student (FK)│
    │title    │  │content       │  │course (FK) │
    │inst(FK) │  │author (FK)   │  │marks       │
    │students[]  │category      │  │grade       │
    │materials   │targetRoles[] │  │semester    │
    └─────────┘  │isPinned      │  │isPublished │
                 └──────────────┘  └────────────┘
         │
     1:N │
         │
         ▼
    ┌────────────┐
    │MATERIAL    │
    ├────────────┤
    │_id         │
    │course (FK) │
    │title       │
    │type        │
    │uploader(FK)│
    │fileUrl     │
    │dueDate     │
    └────────────┘
```

### Collections & Indexes

```javascript
// Users
db.users.createIndex({ email: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ department: 1 })

// API Keys
db.apikeys.createIndex({ user: 1 })
db.apikeys.createIndex({ hashedKey: 1 })
db.apikeys.createIndex({ expiresAt: 1 })

// Courses
db.courses.createIndex({ courseCode: 1 })
db.courses.createIndex({ instructor: 1 })
db.courses.createIndex({ semester: 1, year: 1 })

// Results
db.results.createIndex({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true })
db.results.createIndex({ isPublished: 1 })

// Announcements
db.announcements.createIndex({ author: 1 })
db.announcements.createIndex({ category: 1 })
db.announcements.createIndex({ createdAt: -1 })
db.announcements.createIndex({ isPinned: -1, createdAt: -1 })

// Notifications
db.notifications.createIndex({ recipient: 1, isRead: 1 })
db.notifications.createIndex({ createdAt: -1 })

// Enrollments
db.enrollments.createIndex({ student: 1, course: 1 }, { unique: true })

// Attendance
db.attendance.createIndex({ student: 1, course: 1, date: 1 }, { unique: true })
```

---

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
   │ 3. Email verification (future) │
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

---

## Security Model

### Authentication Flow

```
┌────────────────┐
│   Client       │
└────────┬───────┘
         │
    1. POST /auth/login
    {email, password}
         │
         ▼
┌────────────────────────────────────┐
│   Express Server                   │
│ - Hash input password              │
│ - Compare with DB hash             │
│ - Generate JWT token               │
└────────┬───────────────────────────┘
         │
    2. Return token
         │
         ▼
┌────────────────┐
│   Client       │
│ Store JWT      │
└────────┬───────┘
         │
    3. Future requests with:
       Authorization: Bearer <token>
         │
         ▼
┌────────────────────────────────────┐
│   Express Server                   │
│ - Extract token from header        │
│ - Verify JWT signature             │
│ - Check expiration                 │
│ - Get user info from payload       │
│ - Fetch user from DB               │
│ - Continue request with req.user   │
└────────────────────────────────────┘
```

### API Key Flow

```
┌────────────────┐
│   Admin User   │
└────────┬───────┘
         │
    1. POST /auth/api-key
         │
         ▼
┌────────────────────────────────────┐
│   Express Server                   │
│ - Generate UUID                    │
│ - Hash key with SHA256             │
│ - Store hash in DB                 │
│ - Return key (shown once)          │
└────────┬───────────────────────────┘
         │
    2. Return API key to client
         │
         ▼
┌────────────────┐
│   Client App   │
│ Store API Key  │
└────────┬───────┘
         │
    3. Future requests with:
       X-API-Key: <api-key>
         │
         ▼
┌────────────────────────────────────┐
│   Express Server                   │
│ - Hash received key                │
│ - Compare with stored hash         │
│ - Check if active & not expired    │
│ - Get user from API key doc        │
│ - Update lastUsedAt                │
│ - Continue request                 │
└────────────────────────────────────┘
```

### RBAC Authorization

```
                User Makes Request
                        │
                        ▼
            ┌───────────────────────┐
            │ Check req.user.role   │
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

### Password Security

```
User Input: "MyPassword123"
       │
       ▼
┌──────────────────────────┐
│ bcrypt.genSalt(10)       │ ◄─ BCRYPT_ROUNDS env var
│ Generate random salt     │
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────┐
│ bcrypt.hash(password,    │
│  salt)                   │
│ Hash password with salt  │
└──────────────┬───────────┘
               │
               ▼
    Hashed: $2b$10$9M...abc
       │
       ▼
    Stored in Database
       │
       ▼
Login: User enters password
       │
       ▼
┌──────────────────────────┐
│ bcrypt.compare(input,    │
│  storedHash)             │
│ Compare input with hash  │
└──────────────┬───────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
    Match            No Match
       │                │
       ▼                ▼
  Login OK        Return Error
```

---

## Scalability Considerations

### Database Optimization

1. **Indexing Strategy**
   - Foreign keys indexed for JOIN performance
   - Time-based queries indexed (createdAt)
   - Role-based queries indexed
   - Unique constraints on email and course codes

2. **Query Optimization**
   - Use `.lean()` for read-only queries
   - Batch operations for bulk updates
   - Pagination for large datasets
   - Aggregate pipelines for complex queries

3. **Caching Strategy** (future)
   ```
   - Cache announcements by role
   - Cache course listings
   - Cache user permissions
   - Use Redis for session management
   - TTL-based cache invalidation
   ```

### API Scaling

1. **Rate Limiting**
   - Global limit: 100 req/15min
   - Auth limit: 5 req/15min
   - Per-user limits (future)

2. **Load Balancing** (for production)
   ```
   Internet
      │
      ▼
   Load Balancer (Nginx)
      │
   ┌──┴──┬────┬────┐
   │     │    │    │
   ▼     ▼    ▼    ▼
  API  API  API  API
  Node Node Node Node
   │     │    │    │
   └──────────┬────┘
              │
              ▼
          MongoDB
   (with replication)
   ```

3. **Async Processing**
   - Email notifications → Background queue
   - Bulk result publishing → Worker jobs
   - Report generation → Scheduled tasks

4. **Microservices (future)**
   ```
   API Gateway
      │
   ┌──┼──┬────┬───────────┐
   │  │  │    │           │
   ▼  ▼  ▼    ▼           ▼
  Auth Course Result  Notification
  MS   MS     MS       MS
   ```

### Database Connection Pooling

```javascript
// Mongoose handles connection pooling
// Configurable via MONGODB_URI
mongoose.connect(uri, {
  maxPoolSize: 10,      // Default is 10
  minPoolSize: 2,       // Default is 2
  maxIdleTimeMS: 45000  // Default is 45000
})
```

### Monitoring & Performance

```
Production Monitoring Stack:
┌──────────────┐
│ Application  │
│ (Express)    │
└──────┬───────┘
       │ Metrics
       ▼
┌──────────────┐
│   Prometheus │ ◄─ Collect metrics
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Grafana    │ ◄─ Visualize metrics
└──────────────┘

Alerts for:
- API response time > 1s
- Error rate > 1%
- Memory usage > 80%
- Database connections > pool size
- Disk space < 10%
```

---

**Last Updated:** November 13, 2024
**Version:** 1.0.0
