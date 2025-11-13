const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0, 'Marks cannot be negative'],
      max: [100, 'Marks cannot exceed 100'],
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
      required: true,
    },
    semester: {
      type: String,
      required: true,
      enum: ['Fall', 'Spring', 'Summer'],
    },
    year: {
      type: Number,
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Compound index to prevent duplicates
resultSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });
resultSchema.index({ student: 1 });
resultSchema.index({ course: 1 });
resultSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Result', resultSchema);
