// const Announcement = require('../models/announcement.model');
// const Notification = require('../models/notification.model');

// const notifyUsersOfAnnouncement = async (announcement) => {
//   try {
//     const User = require('../models/user.model');

//     const users = await User.find({
//       role: { $in: announcement.targetRoles },
//     });

//     const notifications = users.map(user => ({
//       recipient: user._id,
//       title: `New ${announcement.category} Announcement`,
//       message: announcement.title,
//       type: 'announcement',
//       relatedResource: {
//         resourceType: 'announcement',
//         resourceId: announcement._id,
//       },
//     }));

//     if (notifications.length > 0) {
//       await Notification.insertMany(notifications);
//     }
//   } catch (error) {
//     console.error('Error creating notifications:', error);
//   }
// };

