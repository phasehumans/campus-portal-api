const { asyncHandler, sendSuccess, sendError, getPaginationParams } = require('../utils/responseHandler');
const { createAnnouncementSchema, updateAnnouncementSchema } = require('../utils/validation');
const announcementService = require('../services/announcementService');

/**
 * Create announcement
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const validatedData = createAnnouncementSchema.parse(req.body);
  const announcement = await announcementService.createAnnouncement(req.user._id, validatedData);

  sendSuccess(res, announcement, 'Announcement created successfully', 201);
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
