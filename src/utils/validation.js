
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
