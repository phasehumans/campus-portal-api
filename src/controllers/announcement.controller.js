const { asyncHandler, sendSuccess, sendError, getPaginationParams } = require('../utils/responseHandler');
const {z} = require('zod');
const { AnnouncementModel } = require('../models/announcement.model.js');


const createAnnouncement = asyncHandler(async (req, res) => {
  const createAnnouncementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    category: z.enum(['academic', 'event', 'maintenance', 'general', 'urgent']).default('general'),
    targetRoles: z.array(z.enum(['student', 'faculty', 'admin'])).default(['student', 'faculty']),
    isPinned: z.boolean().default(false),
  });

  const parseData = createAnnouncementSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const {title, content, category, targetRoles, isPinned} = parseData.data
  const authorId = req.id

  try {
    const announcement = await AnnouncementModel.create({
      title : title, 
      content : content,
      category : category,
      targetRoles : targetRoles,
      isPinned : isPinned,
      author : authorId
    })
  
    if(!announcement){
      return res.status(400).json({
        success : false,
        message : "error while create announcement"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Announcement created successfully",
      announcement : announcement
    });
    
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "internal server error",
      errors : error.message
    })
  }

});

const getAnnouncements = asyncHandler(async (req, res) => {
  const userRole = req.role
  const { page, limit } = getPaginationParams(req.query)
  const skip = (page - 1) * limit;

  try {
    const allannoucements = await AnnouncementModel.find({
      isActive: true,
      targetRoles: userRole,
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await AnnouncementModel.countDocuments({
      isActive : true,
      targetRoles : userRole
    })
  
    if(!allannoucements){
      return res.status(400).json({
        success : false,
        message : "no announcement found"
      })
    }
  
    return res.status(200).json({
      success : true,
      message : "Announcements retrieved successfully",
      announcements : allannoucements,
      pagination : {
        total : total,
        pages : Math.ceil(total / limit),
        curretPage : page,
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

const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcementId = req.params.id;
  const userId = req.id;

  try {
    const announcement = await AnnouncementModel.find({
      _id: announcementId,
    });
  
    if (!announcement) {
      return res.status(400).json({
        success: false,
        message: "announcement not found",
      });
    }
  
    /* 
    
    // Record view
    const hasViewed = announcement.views.some(
      v => v.user.toString() === userId
    );
  
    if (!hasViewed) {
      announcement.views.push({ user: userId });
      await announcement.save();
    }
  
    */
  
    return res.status(200).json({
      success: true,
      message: "Announcement retrieved successfully",
      announcement: announcement,
    });

  } catch (error) {
    return res.status(500).json({
      succcess : false,
      message : "server error",
      errors : error.message
    })
  }

});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const updateAnnouncementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(200).optional(),
    content: z.string().min(10, 'Content must be at least 10 characters').optional(),
    category: z.enum(['academic', 'event', 'maintenance', 'general', 'urgent']).default('general').optional(),
    targetRoles: z.array(z.enum(['student', 'faculty', 'admin'])).default(['student', 'faculty']).optional(),
    isPinned: z.boolean().default(false).optional(),
  })
  const parseData = updateAnnouncementSchema.safeParse(req.body)
  
  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const { title, content, category, targetRoles, isPinned } = parseData.data
  const announcementId = req.params.id
  const authorId = req.id

  try {
    const announcement = await AnnouncementModel.findByIdAndUpdate(
      announcementId,
      {
        title : title,
        content : content,
        category : category,
        targetRoles : targetRoles,
        isPinned : isPinned,
        author : authorId,
        updatedAt : new Date()
      }, {
        new : true,
        runValidators : true
      }
    )
  
    if(!announcement){
      return res.status(400).json({
        success : false,
        message : "announcement not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      announcement : announcement
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcementId = req.params.id
  const userId = req.id

  try {
    const announcement = await AnnouncementModel.find({
      _id : announcementId,
      author : userId
    })
  
    if(!announcement){
      return res.status(400).json({
        success : false,
        message : "announcemnt not found or unauthorized"
      })
    }
  
    await AnnouncementModel.findByIdAndDelete(announcementId)
  
    return res.status(200).json({
      success: true,
      message: "announcement deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }

});

module.exports = {
  createAnnouncement : createAnnouncement,
  getAnnouncements : getAnnouncements,
  getAnnouncementById : getAnnouncementById,
  updateAnnouncement : updateAnnouncement,
  deleteAnnouncement : deleteAnnouncement,
};
