const { asyncHandler, sendSuccess, sendError } = require('../utils/responseHandler.js');

const { z } = require('zod');
const { UserModel } = require('../models/user.model.js');
const bcrypt = require('bcrypt')
const { sendEmail, emailTemplates } = require('../utils/email.js');
const { success } = require('zod/v4');

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

  const parseData = registerSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const {firstName, lastName, email, password, department, phone, role} = parseData.data

  const existUser = await UserModel.findOne({
    email : email
  })

  if(existUser){
    return res.status(409).json({
      success : false,
      message : "user already exists"
    })
  }

  // console.log(process.env.BCRYPT_ROUNDS); >> env var are string

  const hashPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS));

  try {
    const user = await UserModel.create({
      firstName : firstName,
      lastName : lastName,
      email : email,
      password : hashPassword,
      department : department,
      phone : phone,
      role : role
    })
  
    if(user){
      try {
        await sendEmail(
          user.email,
          'Welcome to Campus Portal',
          emailTemplates.welcome(user.firstName, user.email)
        ) 
      } catch (error) {
        console.error("Welcome email failed:", error);
      }
    }
  
    return res.status(200).json({
      success : true,
      message : "user created and welcome email sent",
    })
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "internal server error",
      errors : error.message
    })
  }

});


const login = asyncHandler(async (req, res) => {

  
  // const validatedData = loginSchema.parse(req.body);
  // const result = await authService.loginUser(
  //   validatedData.email,
  //   validatedData.password
  // );

  // sendSuccess(res, result, "Login successful");
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
