const { asyncHandler, sendSuccess, sendError, getPaginationParams } = require('../utils/responseHandler');
// const { createAnnouncementSchema, updateAnnouncementSchema } = require('../utils/validation');
const announcementService = require('../services/announcementService');
const {z} = require('zod');
const { success } = require('zod/v4');
const { AnnouncementModel } = require('../models/announcement.model');


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

/**
 * Get announcements
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await announcementService.getAnnouncements(req.user.role, page, limit);

  sendSuccess(res, result, 'Announcements retrieved successfully');
});

/**
 * Get announcement by ID
 */
const getAnnouncementById = asyncHandler(async (req, res) => {
  const announcement = await announcementService.getAnnouncementById(req.params.id, req.user._id);
  sendSuccess(res, announcement, 'Announcement retrieved successfully');
});

/**
 * Update announcement
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
  const validatedData = updateAnnouncementSchema.parse(req.body);
  const announcement = await announcementService.updateAnnouncement(
    req.params.id,
    validatedData,
    req.user._id,
    req.user.role
  );

  sendSuccess(res, announcement, 'Announcement updated successfully');
});

/**
 * Delete announcement
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const result = await announcementService.deleteAnnouncement(
    req.params.id,
    req.user._id,
    req.user.role
  );

  sendSuccess(res, result, 'Announcement deleted successfully');
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
};
