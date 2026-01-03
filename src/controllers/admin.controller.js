const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler.js');
const adminService = require('../services/adminService');
const { updateUserRoleSchema } = require('../utils/validation.js');
const { UserModel } = require('../models/user.model.js');


const getAllUsers = asyncHandler(async (req, res) => {
  const query = {}
  const filters = req.query
  const { page, limit } = getPaginationParams(req.query);

  if(filters.role){
    query.role = filters.role
  }

  if(filters.department){
    query.department = filters.department
  }

  if(filters.isActive !== undefined){
    query.isActive = filters.isActive
  }

  const skip = (page - 1) * limit

  try {
    const users = await UserModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt : -1})
      .lean()
    
    const total = await UserModel.countDocuments(query)
  
    return res.status(200).json({
      success: true,
      message: "users retrieved successfully",
      users : users,
      pagination : {
        total,
        pages : Math.ceil(total/limit),
        currentPage : page,
        limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "internal server error",
      errors : error.message
    })
  }

});

const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id

  try {
    const user = await UserModel.find({
      _id: userId,
    }).populate("enrolledCourses", "title courseCode semester year")
  
    if(!user){
      return res.status(401).json({
        success : false,
        message : "user not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "user retrieved successfully",
      user : user
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
  getAllUsers : getAllUsers,
  getUserById : getUserById,
  
};
