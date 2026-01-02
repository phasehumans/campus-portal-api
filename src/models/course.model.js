const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Instructor is required'],
    },
    semester: {
      type: String,
      enum: ['Spring', 'Summer', 'Fall', 'Winter'],
      required: [true, 'Semester is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: 1,
      max: 6,
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    enrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
      },
    ],
    schedule: {
      days: [String],
      startTime: String,
      endTime: String,
      room: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({ courseCode: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ semester: 1, year: 1 });
courseSchema.index({ createdAt: -1 });

// // Virtual for enrolled count
// courseSchema.virtual('enrolledCount').get(function() {
//   return this.enrolled ? this.enrolled.length : 0;
// });

// // Ensure virtuals are serialized
// courseSchema.set('toJSON', { virtuals: true });

const CourseModel = mongoose.model('course', courseSchema);

module.exports = {
  CourseModel : CourseModel
}
