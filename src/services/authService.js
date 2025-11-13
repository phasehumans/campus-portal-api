const User = require('../models/User');
const ApiKey = require('../models/ApiKey');
const { signToken } = require('../utils/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

/**
 * Register user
 */
const registerUser = async (data) => {
  const { firstName, lastName, email, password, department, phone, role } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    password,
    department,
    phone,
    role: role || 'student',
  });

  await user.save();

  // Send welcome email
  try {
    await sendEmail(
      user.email,
      'Welcome to Campus Portal',
      emailTemplates.welcome(user.firstName, user.email)
    );
  } catch (error) {
    console.error('Welcome email failed:', error);
  }

  return user;
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('User account is disabled');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = signToken({
    id: user._id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: user.toJSON(),
  };
};

/**
 * Create API key
 */
const createApiKey = async (userId, data) => {
  const { name, description, permissions } = data;

  const apiKey = new ApiKey({
    user: userId,
    name,
    description,
    permissions: permissions || ['read'],
  });

  await apiKey.save();

  // Return key only once for security
  return {
    id: apiKey._id,
    key: apiKey.key,
    name: apiKey.name,
    message: 'Save this key securely. You will not be able to see it again.',
  };
};

/**
 * List API keys
 */
const listApiKeys = async (userId) => {
  const apiKeys = await ApiKey.find({ user: userId });

  return apiKeys.map((key) => ({
    _id: key._id,
    name: key.name,
    description: key.description,
    permissions: key.permissions,
    isActive: key.isActive,
    lastUsedAt: key.lastUsedAt,
    createdAt: key.createdAt,
    expiresAt: key.expiresAt,
  }));
};

/**
 * Revoke API key
 */
const revokeApiKey = async (userId, keyId) => {
  const apiKey = await ApiKey.findOne({ _id: keyId, user: userId });

  if (!apiKey) {
    throw new Error('API key not found');
  }

  apiKey.isActive = false;
  await apiKey.save();

  return { message: 'API key revoked successfully' };
};

/**
 * Get current user
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, data) => {
  const allowedFields = ['firstName', 'lastName', 'phone', 'bio', 'avatar'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  getCurrentUser,
  updateUserProfile,
};
