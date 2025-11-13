const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const adminService = require('../services/adminService');
const { updateUserRoleSchema } = require('../utils/validation');

/**
 * Get all users (Admin only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await adminService.getAllUsers(page, limit, req.query);

  sendSuccess(res, result, 'Users retrieved successfully');
});

/**
 * Get user by ID
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id);
  sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * Update user role (Admin only)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const validatedData = updateUserRoleSchema.parse(req.body);
  const user = await adminService.updateUserRole(req.params.id, validatedData.role);

  sendSuccess(res, user, 'User role updated successfully');
});

/**
 * Deactivate user
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await adminService.deactivateUser(req.params.id);
  sendSuccess(res, user, 'User deactivated successfully');
});

/**
 * Activate user
 */
const activateUser = asyncHandler(async (req, res) => {
  const user = await adminService.activateUser(req.params.id);
  sendSuccess(res, user, 'User activated successfully');
});

/**
 * Get admin statistics
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getAdminStats();
  sendSuccess(res, stats, 'Statistics retrieved successfully');
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  activateUser,
  getStats,
};
