const announcementService = require('../src/services/announcementService');
const Announcement = require('../src/models/Announcement');
const User = require('../src/models/User');

describe('Announcement Service', () => {
  let admin, faculty, student;

  beforeEach(async () => {
    admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'password123',
      department: 'Admin',
      role: 'admin',
    });

    faculty = await User.create({
      firstName: 'Prof',
      lastName: 'Smith',
      email: 'prof@example.com',
      password: 'password123',
      department: 'CS',
      role: 'faculty',
    });

    student = await User.create({
      firstName: 'John',
      lastName: 'Student',
      email: 'student@example.com',
      password: 'password123',
      department: 'CS',
      role: 'student',
    });
  });

  describe('createAnnouncement', () => {
    it('should create announcement for faculty', async () => {
      const announcementData = {
        title: 'Class Cancelled',
        content: 'Class on Friday is cancelled',
        category: 'Academic',
        targetRoles: ['student', 'faculty'],
      };

      const result = await announcementService.createAnnouncement(
        announcementData,
        faculty._id
      );

      expect(result.title).toBe('Class Cancelled');
      expect(result.author.toString()).toBe(faculty._id.toString());
      expect(result.targetRoles).toContain('student');
    });

    it('should create announcement for admin', async () => {
      const announcementData = {
        title: 'System Maintenance',
        content: 'Scheduled maintenance tonight',
        category: 'General',
        targetRoles: ['student', 'faculty', 'admin'],
        isPinned: true,
      };

      const result = await announcementService.createAnnouncement(
        announcementData,
        admin._id
      );

      expect(result.isPinned).toBe(true);
      expect(result.targetRoles.length).toBe(3);
    });
  });

  describe('getAnnouncements', () => {
    beforeEach(async () => {
      await Announcement.create({
        title: 'For Students Only',
        content: 'Student announcement',
        category: 'Academic',
        author: faculty._id,
        targetRoles: ['student'],
      });

      await Announcement.create({
        title: 'For Everyone',
        content: 'General announcement',
        category: 'General',
        author: admin._id,
        targetRoles: ['student', 'faculty', 'admin'],
      });

      await Announcement.create({
        title: 'For Faculty Only',
        content: 'Faculty announcement',
        category: 'Academic',
        author: admin._id,
        targetRoles: ['faculty'],
      });
    });

    it('should return only relevant announcements for student', async () => {
      const results = await announcementService.getAnnouncements(
        {},
        student._id,
        'student'
      );

      expect(results.length).toBe(2); // "For Students Only" and "For Everyone"
      expect(results.every(a => 
        a.targetRoles.includes('student')
      )).toBe(true);
    });

    it('should return only relevant announcements for faculty', async () => {
      const results = await announcementService.getAnnouncements(
        {},
        faculty._id,
        'faculty'
      );

      expect(results.length).toBe(2); // "For Everyone" and "For Faculty Only"
    });

    it('should return all announcements for admin', async () => {
      const results = await announcementService.getAnnouncements(
        {},
        admin._id,
        'admin'
      );

      expect(results.length).toBe(3);
    });
  });

  describe('pinAnnouncement', () => {
    it('should pin announcement for admin', async () => {
      const announcement = await Announcement.create({
        title: 'Important',
        content: 'Important info',
        category: 'General',
        author: admin._id,
        targetRoles: ['student', 'faculty'],
      });

      const result = await announcementService.pinAnnouncement(
        announcement._id,
        admin._id
      );

      expect(result.isPinned).toBe(true);
    });

    it('should unpin announcement for admin', async () => {
      const announcement = await Announcement.create({
        title: 'Important',
        content: 'Important info',
        category: 'General',
        author: admin._id,
        targetRoles: ['student', 'faculty'],
        isPinned: true,
      });

      const result = await announcementService.pinAnnouncement(
        announcement._id,
        admin._id
      );

      expect(result.isPinned).toBe(false);
    });
  });

  describe('trackView', () => {
    it('should track announcement view', async () => {
      const announcement = await Announcement.create({
        title: 'Test',
        content: 'Test announcement',
        category: 'General',
        author: faculty._id,
        targetRoles: ['student'],
      });

      const result = await announcementService.trackView(
        announcement._id,
        student._id
      );

      expect(result.views).toBe(1);
      expect(result.viewedBy).toContain(student._id.toString());
    });

    it('should not duplicate view from same user', async () => {
      const announcement = await Announcement.create({
        title: 'Test',
        content: 'Test announcement',
        category: 'General',
        author: faculty._id,
        targetRoles: ['student'],
      });

      await announcementService.trackView(announcement._id, student._id);
      const result = await announcementService.trackView(
        announcement._id,
        student._id
      );

      expect(result.views).toBe(1);
    });
  });
});
