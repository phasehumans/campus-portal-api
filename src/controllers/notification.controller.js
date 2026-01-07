const { NotificationModel } = require('../models/notification.model.js');
const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler.js');


const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const skip = (page - 1) * limit
  const userId = req.id

  try {
    const notification = await NotificationModel.find({
      recipient: userId,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  
    const total = await NotificationModel.countDocuments({
      recipient : userId
    })

    const unreadCount = await NotificationModel.countDocuments({
      recipient : userId,
      isRead : false
    })
  
    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      unreadCount : unreadCount,
      notifications: notification,
      pagination: {
        total : total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit : total,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const markAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id
  const userId = req.id

  try {
    const notification = await NotificationModel.findOneAndUpdate(
      {
        _id : notificationId,
        recipient : userId
      },{
        isRead : true,
        readAt : new Date()
      },{
        new : true
      }
    )
  
    if(!notification){
      return res.status(400).json({
        success : false,
        message : "notification not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification : notification.isRead
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.id

  try {
    const notification = await NotificationModel.updateMany(
      {
        recipient : userId,
        isRead : false
      },{
        isRead : true,
        readAt : new Date()
      }
    )
  
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      notification : notification
    });

  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
 
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = req.params.id
  const userId = req.id

 try {
   const notification = await NotificationModel.findOneAndDelete({
     _id : notificationId,
     recipient : userId
   })
 
   if(!notification){
     return res.status(400).json({
       success : false,
       message : "notification not found"
     })
   }
 
   return res.status(200).json({
     success : true,
     message : "Notification deleted successfully",
     notification : notification
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
  getNotifications : getNotifications,
  markAsRead : markAsRead,
  markAllAsRead : markAllAsRead,
  deleteNotification : deleteNotification,
};
