const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'video', 'image', 'other'],
      default: 'other',
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
    },
    downloads: {
      type: Number,
      default: 0,
    },
    downloadedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        downloadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
materialSchema.index({ course: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ isPinned: -1 });

module.exports = mongoose.model('Material', materialSchema);
