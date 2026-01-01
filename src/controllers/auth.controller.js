// const { asyncHandler, sendSuccess, sendError } = require('../utils/responseHandler');
// const { registerSchema, loginSchema, createApiKeySchema } = require('../utils/validation');
// const authService = require('../services/authService');

const { z } = require("zod");

const register = asyncHandler(async (req, res) => {
  const registerSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    department: z.string().min(1, "Department is required"),
    phone: z.string().optional(),
    role: z.enum(["student", "faculty"]).default("student"),
  });

  

});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.loginUser(
    validatedData.email,
    validatedData.password
  );

  sendSuccess(res, result, "Login successful");
});

/**
 * Create API key
 */
const createApiKey = asyncHandler(async (req, res) => {
  const validatedData = createApiKeySchema.parse(req.body);
  const apiKey = await authService.createApiKey(req.user._id, validatedData);

  sendSuccess(res, apiKey, "API key created successfully", 201);
});

/**
 * List API keys
 */
const listApiKeys = asyncHandler(async (req, res) => {
  const apiKeys = await authService.listApiKeys(req.user._id);
  sendSuccess(res, apiKeys, "API keys retrieved successfully");
});

/**
 * Revoke API key
 */
const revokeApiKey = asyncHandler(async (req, res) => {
  const result = await authService.revokeApiKey(req.user._id, req.params.keyId);
  sendSuccess(res, result, "API key revoked successfully");
});

/**
 * Get current user
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user._id);
  sendSuccess(res, user, "User retrieved successfully");
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user._id, req.body);
  sendSuccess(res, user, "Profile updated successfully");
});

module.exports = {
  register: register,
  login: login,
  createApiKey: createApiKey,
  listApiKeys: listApiKeys,
  revokeApiKey: revokeApiKey,
  getCurrentUser: getCurrentUser,
  updateProfile: updateProfile,
};
