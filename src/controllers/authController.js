const { asyncHandler, sendSuccess, sendError } = require('../utils/responseHandler');
const { registerSchema, loginSchema, createApiKeySchema } = require('../utils/validation');
const authService = require('../services/authService');

/**
 * Register user
 */
const register = asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  const user = await authService.registerUser(validatedData);

  sendSuccess(res, { user }, 'User registered successfully', 201);
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.loginUser(validatedData.email, validatedData.password);

  sendSuccess(res, result, 'Login successful');
});

/**
 * Create API key
 */
const createApiKey = asyncHandler(async (req, res) => {
  const validatedData = createApiKeySchema.parse(req.body);
  const apiKey = await authService.createApiKey(req.user._id, validatedData);

  sendSuccess(res, apiKey, 'API key created successfully', 201);
});

/**
 * List API keys
 */
const listApiKeys = asyncHandler(async (req, res) => {
  const apiKeys = await authService.listApiKeys(req.user._id);
  sendSuccess(res, apiKeys, 'API keys retrieved successfully');
});

/**
 * Revoke API key
 */
const revokeApiKey = asyncHandler(async (req, res) => {
  const result = await authService.revokeApiKey(req.user._id, req.params.keyId);
  sendSuccess(res, result, 'API key revoked successfully');
});

/**
 * Get current user
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  sendSuccess(res, user, 'User retrieved successfully');
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  sendSuccess(res, user, 'Profile updated successfully');
});

module.exports = {
  register,
  login,
  createApiKey,
  listApiKeys,
  revokeApiKey,
  getCurrentUser,
  updateProfile,
};
