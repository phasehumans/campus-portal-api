const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Student is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
      required: [true, 'Course is required'],
    },
    semester: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter'],
      required: [true, 'Semester is required'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F', 'N/A'],
      default: 'N/A',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

resultSchema.index({ student: 1, course: 1, semester: 1, year: 1 }, { unique: true });
resultSchema.index({ student: 1 });
resultSchema.index({ course: 1 });
resultSchema.index({ isPublished: 1 });
resultSchema.index({ createdAt: -1 });

// Pre-save hook to calculate grade based on marks
resultSchema.pre('save', function(next) {
  if (this.isModified('marks')) {
    if (this.marks >= 90) this.grade = 'A';
    else if (this.marks >= 80) this.grade = 'B';
    else if (this.marks >= 70) this.grade = 'C';
    else if (this.marks >= 60) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

const ResultModel = mongoose.model('result', resultSchema);

module.exports = {
  ResultModel : ResultModel
}
