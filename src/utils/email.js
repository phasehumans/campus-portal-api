const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `${process.env.MAIL_FROM_NAME} <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

/**
 * Email templates
 */
const emailTemplates = {
  welcome: (firstName, email) => `
    <h1>Welcome to Campus Portal!</h1>
    <p>Hi ${firstName},</p>
    <p>Your account has been created successfully.</p>
    <p><strong>Email:</strong> ${email}</p>
    <p>You can now login to your account.</p>
    <a href="${process.env.CLIENT_URL}/login">Login Here</a>
  `,

  resultPublished: (studentName, courseName) => `
    <h1>Results Published</h1>
    <p>Hi ${studentName},</p>
    <p>Your results for <strong>${courseName}</strong> have been published.</p>
    <p>Log in to view your grades and details.</p>
    <a href="${process.env.CLIENT_URL}/results">View Results</a>
  `,

  announcementPosted: (title) => `
    <h1>New Announcement</h1>
    <p>A new announcement has been posted: <strong>${title}</strong></p>
    <a href="${process.env.CLIENT_URL}/announcements">View Announcement</a>
  `,

  eventCreated: (eventTitle, eventDate) => `
    <h1>New Event</h1>
    <p>A new event has been created: <strong>${eventTitle}</strong></p>
    <p><strong>Date:</strong> ${eventDate}</p>
    <a href="${process.env.CLIENT_URL}/events">Register Now</a>
  `,

  enrollmentConfirmation: (studentName, courseName) => `
    <h1>Enrollment Confirmed</h1>
    <p>Hi ${studentName},</p>
    <p>You have been successfully enrolled in <strong>${courseName}</strong>.</p>
    <a href="${process.env.CLIENT_URL}/courses">View Course</a>
  `,
};

module.exports = {
  sendEmail,
  emailTemplates,
  createTransporter,
};
