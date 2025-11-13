const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['academic', 'event', 'maintenance', 'general', 'urgent'],
      default: 'general',
    },
    targetRoles: [
      {
        type: String,
        enum: ['student', 'faculty', 'admin'],
      },
    ],
    attachments: [
      {
        filename: String,
        url: String,
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
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
announcementSchema.index({ author: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
