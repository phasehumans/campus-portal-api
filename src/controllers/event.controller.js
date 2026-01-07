const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const {EventModel} = require('../models/event.model.js')
const {NotificationModel} = require('../models/notification.model.js')
const { z } = require('zod');


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

const registerForEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id
  const userId = req.id

  try {
    const event = await EventModel.findById(eventId)
  
    if(!event){
      return res.status(400).json({
        success : false,
        message : "event not found"
      })
    }
  
    if(event.registrations.length >= event.capacity){
      return res.status(400).json({
        success : false,
        message : "event is full"
      })
    }
  
    const alreadyRegistered = event.registrations.some(
      r => r.user.toString() === userId.toString()
    )
  
    if(alreadyRegistered){
      return res.status(400).json({
        success : false,
        message : "already registered for this event"
      })
    }
  
    event.registrations.push({user : userId})
    await event.save()
  
    return res.status(201).json({
      success: true,
      message: "Registered for event successfully",
      event : event
    });

  } catch (error) {
    return res.status(500).json({
      success : true,
      message : "server error",
      errors : error.message
    })
  }
});

const unregisterFromEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id
  const userId = req.id

  try {
    const event = await EventModel.findByIdAndUpdate(
      eventId,
      {
        $pull : {
          registrations : { user : userId}
        }
      },
      {
        new : true,
      }
    )
  
    if(!event){
      return res.status(400).json({
        success : false,
        message : "event not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Unregistered from event successfully",
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

const updateEvent = asyncHandler(async (req, res) => {
  const updateEventSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    location: z.string().min(1, 'Location is required'),
    category: z.enum(['academic', 'cultural', 'sports', 'workshop', 'seminar', 'other']),
    capacity: z.number().min(1),
    isPublished : z.boolean()
  })

  const parseData = updateEventSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const {title, description, location, category, capacity, isPublished} = parseData.data
  const eventId = req.params.id

  try {
    const event =await EventModel.findByIdAndUpdate(
      eventId,
      {
        title : title,
        description : description,
        location : location,
        category : category,
        capacity : capacity,
        isPublished : isPublished,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!event){
      return res.status(400).json({
        success : false,
        message : "event not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
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

const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id

  try {
    const event = await EventModel.findByIdAndDelete(eventId)
  
    if(!event){
      return res.status(400).json({
        success : false,
        message : "event not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
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

/* 
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
}; */

module.exports = {
  createEvent : createEvent,
  getEvents : getEvents,
  getEventById : getEventById,
  registerForEvent : registerForEvent,
  unregisterFromEvent : unregisterFromEvent,
  updateEvent : updateEvent,
  deleteEvent : deleteEvent,
};
