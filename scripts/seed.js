require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Course = require('./src/models/Course');
const Announcement = require('./src/models/Announcement');

/**
 * Seed database with sample data
 */
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-portal');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@campusportal.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
    });
    console.log('Created admin user:', adminUser.email);

    const facultyUser = await User.create({
      firstName: 'Dr. James',
      lastName: 'Smith',
      email: 'james@campusportal.com',
      password: 'Faculty@123',
      role: 'faculty',
      department: 'Computer Science',
    });
    console.log('Created faculty user:', facultyUser.email);

    const studentUser = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@campusportal.com',
      password: 'Student@123',
      role: 'student',
      department: 'Computer Science',
    });
    console.log('Created student user:', studentUser.email);

    // Create courses
    const course1 = await Course.create({
      courseCode: 'CS101',
      title: 'Introduction to Computer Science',
      description: 'Fundamentals of computer science',
      credits: 3,
      instructor: facultyUser._id,
      department: 'Computer Science',
      semester: 'Fall',
      year: 2024,
      maxStudents: 50,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        time: '10:00-11:30',
        location: 'Building A, Room 101',
      },
    });
    console.log('Created course:', course1.courseCode);

    const course2 = await Course.create({
      courseCode: 'CS201',
      title: 'Data Structures and Algorithms',
      description: 'Learn data structures and algorithm design',
      credits: 4,
      instructor: facultyUser._id,
      department: 'Computer Science',
      semester: 'Spring',
      year: 2024,
      maxStudents: 40,
      schedule: {
        days: ['Tuesday', 'Thursday'],
        time: '14:00-15:30',
        location: 'Building B, Room 202',
      },
    });
    console.log('Created course:', course2.courseCode);

    // Create announcements
    const announcement = await Announcement.create({
      title: 'Welcome to Campus Portal',
      content: 'Welcome to the new campus management system. This platform will help you manage your courses, track your results, and stay updated with campus news.',
      author: adminUser._id,
      category: 'general',
      targetRoles: ['student', 'faculty'],
      isPinned: true,
    });
    console.log('Created announcement:', announcement.title);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin - Email: admin@campusportal.com, Password: Admin@123');
    console.log('Faculty - Email: james@campusportal.com, Password: Faculty@123');
    console.log('Student - Email: john@campusportal.com, Password: Student@123');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
