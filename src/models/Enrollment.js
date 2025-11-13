const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    status: {
      type: String,
      enum: ['active', 'dropped', 'completed', 'suspended'],
      default: 'active',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    droppedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    attendancePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F', 'N/A', 'IP'],
      default: 'IP',
    },
    semester: {
      type: String,
      required: [true, 'Semester is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
  },
  { timestamps: true }
);

// Compound unique index
enrollmentSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
