const User = require('../models/user.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');

/**
 * Get all users
 */
const getAllUsers = async (page = 1, limit = 20, filters = {}) => {
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.department) {
    query.department = filters.department;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await User.countDocuments(query);

  return {
    users,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .populate('enrolledCourses', 'title courseCode semester year');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Update user role
 */
const updateUserRole = async (userId, newRole) => {
  const validRoles = ['student', 'faculty', 'admin'];

  if (!validRoles.includes(newRole)) {
    throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Deactivate user
 */
const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Activate user
 */
const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true, updatedAt: new Date() },
    { new: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Get admin statistics
 */
const getAdminStats = async () => {
  const totalUsers = await User.countDocuments();
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalCourses = await Course.countDocuments();
  const totalEnrollments = await Enrollment.countDocuments();

  const activeCourses = await Course.countDocuments({ isActive: true });
  const activeUsers = await User.countDocuments({ isActive: true });

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      byRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    },
    courses: {
      total: totalCourses,
      active: activeCourses,
    },
    enrollments: {
      total: totalEnrollments,
    },
  };
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  getAdminStats,
};
