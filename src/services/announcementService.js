const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

/**
 * Create announcement
 */
const createAnnouncement = async (userId, data) => {
  const { title, content, category, targetRoles, isPinned } = data;

  const announcement = new Announcement({
    title,
    content,
    author: userId,
    category,
    targetRoles: targetRoles || ['student', 'faculty'],
    isPinned,
  });

  await announcement.save();
  await announcement.populate('author', 'firstName lastName email');

  // Create notifications for target roles
  await notifyUsersOfAnnouncement(announcement);

  return announcement;
};

/**
 * Get announcements with role-based filtering
 */
const getAnnouncements = async (userRole, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const announcements = await Announcement.find({
    isPublished: true,
    targetRoles: userRole,
  })
    .populate('author', 'firstName lastName email')
    .sort({ isPinned: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Announcement.countDocuments({
    isPublished: true,
    targetRoles: userRole,
  });

  return {
    announcements,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get single announcement
 */
const getAnnouncementById = async (announcementId, userId) => {
  const announcement = await Announcement.findById(announcementId).populate(
    'author',
    'firstName lastName email'
  );

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  // Record view
  const hasViewed = announcement.views.some(
    v => v.user.toString() === userId
  );

  if (!hasViewed) {
    announcement.views.push({ user: userId });
    await announcement.save();
  }

  return announcement;
};

/**
 * Update announcement
 */
const updateAnnouncement = async (announcementId, data, userId) => {
  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  // Check ownership
  if (announcement.author.toString() !== userId.toString() && userRole !== 'admin') {
    throw new Error('Not authorized to update this announcement');
  }

  const { title, content, category, targetRoles, isPinned } = data;

  announcement.title = title || announcement.title;
  announcement.content = content || announcement.content;
  announcement.category = category || announcement.category;
  announcement.targetRoles = targetRoles || announcement.targetRoles;
  announcement.isPinned = isPinned !== undefined ? isPinned : announcement.isPinned;
  announcement.updatedAt = new Date();

  await announcement.save();
  return announcement;
};

/**
 * Delete announcement
 */
const deleteAnnouncement = async (announcementId, userId, userRole) => {
  const announcement = await Announcement.findById(announcementId);

  if (!announcement) {
    throw new Error('Announcement not found');
  }

  // Check ownership
  if (announcement.author.toString() !== userId.toString() && userRole !== 'admin') {
    throw new Error('Not authorized to delete this announcement');
  }

  await Announcement.findByIdAndDelete(announcementId);

  return { message: 'Announcement deleted successfully' };
};

/**
 * Notify users of new announcement
 */
const notifyUsersOfAnnouncement = async (announcement) => {
  try {
    const User = require('../models/User');

    const users = await User.find({
      role: { $in: announcement.targetRoles },
    });

    const notifications = users.map(user => ({
      recipient: user._id,
      title: `New ${announcement.category} Announcement`,
      message: announcement.title,
      type: 'announcement',
      relatedResource: {
        resourceType: 'announcement',
        resourceId: announcement._id,
      },
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
  notifyUsersOfAnnouncement,
};
