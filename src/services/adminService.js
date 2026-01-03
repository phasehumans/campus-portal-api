const User = require('../models/user.model');
const Course = require('../models/course.model');
const Enrollment = require('../models/enrollment.model');


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
  updateUserRole,
  deactivateUser,
  activateUser,
  getAdminStats,
};
