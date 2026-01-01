const Event = require('../models/event.model');
const Notification = require('../models/notification.model');

/**
 * Create event
 */
const createEvent = async (data, organizerId) => {
  const { title, description, startDate, endDate, location, category, capacity, visibleTo } = data;

  if (new Date(startDate) >= new Date(endDate)) {
    throw new Error('Start date must be before end date');
  }

  const event = new Event({
    title,
    description,
    organizer: organizerId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    location,
    category,
    capacity,
    visibleTo: visibleTo || ['student', 'faculty'],
  });

  await event.save();
  await event.populate('organizer', 'firstName lastName email');

  // Notify eligible users
  await notifyEventCreation(event);

  return event;
};

/**
 * Get events
 */
const getEvents = async (userRole, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const events = await Event.find({
    isPublished: true,
    visibleTo: userRole,
    startDate: { $gte: new Date() }, // Future events only
  })
    .populate('organizer', 'firstName lastName email')
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Event.countDocuments({
    isPublished: true,
    visibleTo: userRole,
    startDate: { $gte: new Date() },
  });

  return {
    events,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get event by ID
 */
const getEventById = async (eventId) => {
  const event = await Event.findById(eventId).populate('organizer', 'firstName lastName email');

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
};

/**
 * Register for event
 */
const registerForEvent = async (eventId, userId) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  // Check capacity
  if (event.registrations.length >= event.capacity) {
    throw new Error('Event is full');
  }

  // Check if already registered
  const alreadyRegistered = event.registrations.some(
    r => r.user.toString() === userId.toString()
  );

  if (alreadyRegistered) {
    throw new Error('Already registered for this event');
  }

  event.registrations.push({ user: userId });
  await event.save();

  return event;
};

/**
 * Unregister from event
 */
const unregisterFromEvent = async (eventId, userId) => {
  const event = await Event.findByIdAndUpdate(
    eventId,
    {
      $pull: {
        registrations: { user: userId },
      },
    },
    { new: true }
  );

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
};

/**
 * Update event
 */
const updateEvent = async (eventId, data) => {
  const allowedFields = ['title', 'description', 'location', 'capacity', 'isPublished'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const event = await Event.findByIdAndUpdate(
    eventId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
};

/**
 * Delete event
 */
const deleteEvent = async (eventId) => {
  const event = await Event.findByIdAndDelete(eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  return { message: 'Event deleted successfully' };
};

/**
 * Notify users of event creation
 */
const notifyEventCreation = async (event) => {
  try {
    const User = require('../models/user.model');

    const users = await User.find({
      role: { $in: event.visibleTo },
    });

    const notifications = users.map(user => ({
      recipient: user._id,
      title: `New ${event.category} Event`,
      message: `${event.title} on ${event.startDate.toDateString()}`,
      type: 'event',
      relatedResource: {
        resourceType: 'event',
        resourceId: event._id,
      },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating event notifications:', error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  updateEvent,
  deleteEvent,
  notifyEventCreation,
};
