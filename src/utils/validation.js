


// const createAnnouncementSchema = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters').max(200),
//   content: z.string().min(10, 'Content must be at least 10 characters'),
//   category: z.enum(['academic', 'event', 'maintenance', 'general', 'urgent']).default('general'),
//   targetRoles: z.array(z.enum(['student', 'faculty', 'admin'])).default(['student', 'faculty']),
//   isPinned: z.boolean().default(false),
// });

// const updateAnnouncementSchema = createAnnouncementSchema.partial();

// /**
//  * Result validation schemas
//  */
// const createResultSchema = z.object({
//   student: z.string().min(1, 'Student ID is required'),
//   course: z.string().min(1, 'Course ID is required'),
//   marks: z.number().min(0).max(100, 'Marks must be between 0 and 100'),
//   grade: z.enum(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']),
//   semester: z.enum(['Fall', 'Spring', 'Summer']),
//   year: z.number().int().min(2000),
//   remarks: z.string().optional(),
// });

// const updateResultSchema = createResultSchema.partial();

// /**
//  * Course validation schemas
//  */
// const createCourseSchema = z.object({
//   courseCode: z.string().min(1, 'Course code is required').toUpperCase(),
//   title: z.string().min(5, 'Title must be at least 5 characters'),
//   description: z.string().optional(),
//   credits: z.number().min(1).max(10),
//   instructor: z.string().min(1, 'Instructor ID is required'),
//   department: z.string().min(1, 'Department is required'),
//   semester: z.enum(['Fall', 'Spring', 'Summer']),
//   year: z.number().int().min(2000),
//   maxStudents: z.number().min(1),
//   schedule: z.object({
//     days: z.array(z.string()).optional(),
//     time: z.string().optional(),
//     location: z.string().optional(),
//   }).optional(),
// });

// const updateCourseSchema = createCourseSchema.partial();

// /**
//  * Material validation schemas
//  */
// const createMaterialSchema = z.object({
//   title: z.string().min(1, 'Title is required'),
//   description: z.string().optional(),
//   type: z.enum(['lecture', 'assignment', 'reading', 'video', 'document', 'other']),
//   fileName: z.string().min(1, 'File name is required'),
//   fileSize: z.number().min(1),
//   dueDate: z.string().datetime().optional().or(z.null()),
// });

// const updateMaterialSchema = createMaterialSchema.partial();

// /**
//  * Event validation schemas
//  */
// const createEventSchema = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters'),
//   description: z.string().min(10, 'Description must be at least 10 characters'),
//   startDate: z.string().datetime(),
//   endDate: z.string().datetime(),
//   location: z.string().min(1, 'Location is required'),
//   category: z.enum(['academic', 'cultural', 'sports', 'technical', 'social', 'other']),
//   capacity: z.number().min(1),
//   visibleTo: z.array(z.enum(['student', 'faculty', 'admin'])).default(['student', 'faculty']),
// });

// const updateEventSchema = createEventSchema.partial();

// /**
//  * Enrollment validation schemas
//  */
// const createEnrollmentSchema = z.object({
//   student: z.string().min(1, 'Student ID is required'),
//   course: z.string().min(1, 'Course ID is required'),
// });

// const updateEnrollmentSchema = z.object({
//   status: z.enum(['active', 'completed', 'dropped', 'suspended']).optional(),
//   attendancePercentage: z.number().min(0).max(100).optional(),
// });

// /**
//  * Attendance validation schemas
//  */
// const createAttendanceSchema = z.object({
//   student: z.string().min(1, 'Student ID is required'),
//   course: z.string().min(1, 'Course ID is required'),
//   date: z.string().datetime(),
//   status: z.enum(['present', 'absent', 'late', 'excused']),
//   remarks: z.string().optional(),
// });

// const updateAttendanceSchema = createAttendanceSchema.partial();

// /**
//  * User validation schemas
//  */
// const updateUserRoleSchema = z.object({
//   role: z.enum(['student', 'faculty', 'admin']),
// });

// module.exports = {
//   registerSchema,
//   loginSchema,
//   createApiKeySchema,
//   createAnnouncementSchema,
//   updateAnnouncementSchema,
//   createResultSchema,
//   updateResultSchema,
//   createCourseSchema,
//   updateCourseSchema,
//   createMaterialSchema,
//   updateMaterialSchema,
//   createEventSchema,
//   updateEventSchema,
//   createEnrollmentSchema,
//   updateEnrollmentSchema,
//   createAttendanceSchema,
//   updateAttendanceSchema,
//   updateUserRoleSchema,
// };
