const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'other'],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    visibleTo: [
      {
        type: String,
        enum: ['student', 'faculty', 'admin'],
      },
    ],
    isPublished: {
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
eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Event', eventSchema);
