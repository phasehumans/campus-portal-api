const { asyncHandler, getPaginationParams } = require('../utils/responseHandler.js');
const { UserModel } = require('../models/user.model.js');
const { z } = require('zod');
const { CourseModel } = require('../models/course.model.js');
const { EnrollmentModel } = require('../models/enrollment.model.js');


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

const updateUserRole = asyncHandler(async (req, res) => {
  const updateUserRoleSchema = z.object({
    role: z.enum(["student", "faculty", "admin"])
  })

  const parseData = updateUserRoleSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs"
    })
  }

  const {role} = parseData.data
  const userId = req.params.id

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId, 
      {
        role : role,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!user){
      return res.status(400).json({
        success : false,
        message : "user not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "user role updated successfully",
      updatedRole : user.role
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const deactivateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        isActive : false,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!user){
      return res.status(400).json({
        success : false,
        message : "user not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "user deactivated successfully"
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const activateUser = asyncHandler(async (req, res) => {
  const userId = req.params.id

  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        isActive : true,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!user){
      return res.status(400).json({
        success : false,
        message : "user not found"
      })
    }
  
    return res.status(200).json({
      success : true,
      message : "user activated successfully"
    })

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
  
});

const getStats = asyncHandler(async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments()
  
    const usersByRole = await UserModel.aggregate([
      {
        $group : {
          _id : '$role',
          count : { $sum : 1},
        }
      }
    ])
  
    const totalCourses = await CourseModel.countDocuments()
    const totalEnrollments = await EnrollmentModel.countDocuments()
  
    const activeCourses = await CourseModel.countDocuments({
      isActive : true
    })
    const activeUsers = await UserModel.countDocuments({
      isActive : true
    })
    
    return res.status(200).json({
      success: true,
      message: "Statistics retrieved successfully",
      users : {
        total : totalUsers,
        active : activeUsers,
        byRole : usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      }, 
      courses : {
        total : totalCourses,
        active : activeCourses
      },
      enrollements : {
        total : totalEnrollments
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


module.exports = {
  getAllUsers : getAllUsers,
  getUserById : getUserById,
  updateUserRole : updateUserRole,
  deactivateUser : deactivateUser,
  activateUser : activateUser,
  getStats : getStats
};
