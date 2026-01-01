const User = require('../models/User');
const ApiKey = require('../models/apikey.model');
const { signToken } = require('../utils/auth');
const { sendEmail, emailTemplates } = require('../utils/email');




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



module.exports = {
  registerUser,
  loginUser,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  getCurrentUser,
  updateUserProfile,
};
