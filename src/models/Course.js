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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    credits: {
      type: Number,
      required: [true, 'Credits are required'],
      min: [1, 'Credits must be at least 1'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      enum: ['Fall', 'Spring', 'Summer'],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    schedule: {
      days: [String], // ['Monday', 'Wednesday', 'Friday']
      time: String, // '10:00-11:30'
      location: String,
    },
    maxStudents: {
      type: Number,
      required: true,
      min: [1, 'Max students must be at least 1'],
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    prerequisites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
courseSchema.index({ courseCode: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ semester: 1, year: 1 });

module.exports = mongoose.model('Course', courseSchema);
