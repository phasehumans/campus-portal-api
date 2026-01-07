const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const {EventModel} = require('../models/event.model.js')
const {NotificationModel} = require('../models/notification.model.js')
const { z } = require('zod');
const { success } = require('zod/v4');

const createEvent = asyncHandler(async (req, res) => {
  const createEventSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    location: z.string().min(1, 'Location is required'),
    category: z.enum(['academic', 'cultural', 'sports', 'workshop', 'seminar', 'other']),
    capacity: z.number().min(1),
  });

  const parseData = createEventSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  try {
    const {title, description, startDate, endDate, location, category, capacity} = parseData.data
    const userId = req.id
  
    const event = await EventModel.create({
      title : title,
      description : description,
      startDate : new Date(startDate),
      endDate : new Date(endDate),
      location : location,
      organizer : userId,
      category : category,
      capacity : capacity,
  
    })

    // notification
  
    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event : event
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const getEvents = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const skip = (page - 1) * limit

  try {
    const events = await EventModel.find({
      isPublished: true,
      startDate: { $gte: new Date() }
    }).sort({startDate :-1}).skip(skip).limit(limit)
  
    const total = await EventModel.countDocuments({
      isPublished : true,
      startDate : {$gte : new Date()}
    })
  
    return res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      events : events,
      pagination : {
        total : total,
        pages : Math.ceil(total/limit),
        currentPage : page,
        limit : limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
  
});

const getEventById = asyncHandler(async (req, res) => {
  const eventId = req.params.id

  try {
    const event = await EventModel.findOne({
      _id : eventId,
      isPublished : true
    })
  
    if(!event){
      return res.status(400).json({
        success : false,
        message : "event not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Event retrieved successfully",
      event : event
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

/**
 * Register for event
 */
const registerForEvent = asyncHandler(async (req, res) => {
  // const event = await eventService.registerForEvent(req.params.id, req.user._id);
  // sendSuccess(res, event, 'Registered for event successfully', 201);
});

/**
 * Unregister from event
 */
const unregisterFromEvent = asyncHandler(async (req, res) => {
  // const event = await eventService.unregisterFromEvent(req.params.id, req.user._id);
  // sendSuccess(res, event, 'Unregistered from event successfully');
});

/**
 * Update event
 */
const updateEvent = asyncHandler(async (req, res) => {
  // const validatedData = updateEventSchema.parse(req.body);
  // const event = await eventService.updateEvent(req.params.id, validatedData);

  // sendSuccess(res, event, 'Event updated successfully');
});

/**
 * Delete event
 */
const deleteEvent = asyncHandler(async (req, res) => {
  // const result = await eventService.deleteEvent(req.params.id);
  // sendSuccess(res, result, 'Event deleted successfully');
});

module.exports = {
  createEvent : createEvent,
  getEvents : getEvents,
  getEventById : getEventById,
  registerForEvent : registerForEvent,
  unregisterFromEvent : unregisterFromEvent,
  updateEvent : updateEvent,
  deleteEvent : deleteEvent,
};
