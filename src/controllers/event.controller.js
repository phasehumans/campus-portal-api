const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const eventService = require('../services/eventService');
const { createEventSchema, updateEventSchema } = require('../utils/validation');

/**
 * Create event
 */
const createEvent = asyncHandler(async (req, res) => {
  const validatedData = createEventSchema.parse(req.body);
  const event = await eventService.createEvent(validatedData, req.user._id);

  sendSuccess(res, event, 'Event created successfully', 201);
});

/**
 * Get events
 */
const getEvents = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await eventService.getEvents(req.user.role, page, limit);

  sendSuccess(res, result, 'Events retrieved successfully');
});

/**
 * Get event by ID
 */
const getEventById = asyncHandler(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  sendSuccess(res, event, 'Event retrieved successfully');
});

/**
 * Register for event
 */
const registerForEvent = asyncHandler(async (req, res) => {
  const event = await eventService.registerForEvent(req.params.id, req.user._id);
  sendSuccess(res, event, 'Registered for event successfully', 201);
});

/**
 * Unregister from event
 */
const unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await eventService.unregisterFromEvent(req.params.id, req.user._id);
  sendSuccess(res, event, 'Unregistered from event successfully');
});

/**
 * Update event
 */
const updateEvent = asyncHandler(async (req, res) => {
  const validatedData = updateEventSchema.parse(req.body);
  const event = await eventService.updateEvent(req.params.id, validatedData);

  sendSuccess(res, event, 'Event updated successfully');
});

/**
 * Delete event
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const result = await eventService.deleteEvent(req.params.id);
  sendSuccess(res, result, 'Event deleted successfully');
});

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  registerForEvent,
  unregisterFromEvent,
  updateEvent,
  deleteEvent,
};
