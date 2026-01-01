const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    category: {
      type: String,
      enum: ['Academic', 'General', 'Event', 'Administrative', 'Emergency'],
      default: 'General',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    targetRoles: [
      {
        type: String,
        enum: ['student', 'faculty', 'admin'],
      },
    ],
    isPinned: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ author: 1 });
announcementSchema.index({ category: 1 });
announcementSchema.index({ isPinned: -1, createdAt: -1 });
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetRoles: 1 });

const AnnouncementModel = mongoose.model('announcement', announcementSchema);

module.exports = {
  AnnouncementModel : AnnouncementModel
}