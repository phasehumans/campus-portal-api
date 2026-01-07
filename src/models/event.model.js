const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
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
      required: [true, 'Location is required'],
      trim: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Organizer is required'],
    },
    category: {
      type: String,
      enum: ['academic', 'sports', 'cultural', 'workshop', 'seminar', 'other'],
      default: 'Other',
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: 1,
    },
    registrations: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'user',
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['registered', 'attended', 'cancelled'],
          default: 'registered',
        },
      },
    ],
    image: {
      type: String,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for registered count
eventSchema.virtual('registeredCount').get(function() {
  return this.registrations ? this.registrations.length : 0;
});

// Ensure virtuals are serialized
eventSchema.set('toJSON', { virtuals: true });

const EventModel = mongoose.model('event', eventSchema);

module.exports = {
  EventModel : EventModel
}
