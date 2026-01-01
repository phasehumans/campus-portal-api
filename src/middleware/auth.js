const User = require('../models/user.model');
const { verifyJWT, verifyApiKey } = require('../utils/auth');
const { sendError } = require('../utils/responseHandler');

/**
 * Authenticate user via JWT or API Key
 */
const authenticate = async (req, res, next) => {
  try {
    let token;
    let user;
    let apiKey;

    // Check for JWT in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = verifyJWT(token);
        user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
          return sendError(res, 'User not found or inactive', 401);
        }

        req.user = user;
        req.authMethod = 'jwt';
      } catch (error) {
        return sendError(res, 'Invalid JWT token', 401);
      }
    } else if (req.headers['x-api-key']) {
      // Check for API Key
      apiKey = req.headers['x-api-key'];
      try {
        const apiKeyDoc = await verifyApiKey(apiKey);

        if (!apiKeyDoc) {
          return sendError(res, 'Invalid or expired API key', 401);
        }

        user = apiKeyDoc.user;

        if (!user.isActive) {
          return sendError(res, 'User is inactive', 401);
        }

        req.user = user;
        req.apiKey = apiKeyDoc;
        req.authMethod = 'api-key';

        // Update last used time
        apiKeyDoc.lastUsedAt = new Date();
        await apiKeyDoc.save();
      } catch (error) {
        return sendError(res, 'Invalid API key', 401);
      }
    } else {
      return sendError(res, 'No authentication credentials provided', 401);
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    sendError(res, 'Authentication failed', 500, error.message);
  }
};

/**
 * Optional authentication - doesn't fail if no auth provided
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    let user;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = verifyJWT(token);
        user = await User.findById(decoded.id);

        if (user && user.isActive) {
          req.user = user;
          req.authMethod = 'jwt';
        }
      } catch (error) {
        // Fail silently for optional auth
      }
    } else if (req.headers['x-api-key']) {
      try {
        const apiKey = req.headers['x-api-key'];
        const apiKeyDoc = await verifyApiKey(apiKey);

        if (apiKeyDoc && apiKeyDoc.user.isActive) {
          req.user = apiKeyDoc.user;
          req.apiKey = apiKeyDoc;
          req.authMethod = 'api-key';
          apiKeyDoc.lastUsedAt = new Date();
          await apiKeyDoc.save();
        }
      } catch (error) {
        // Fail silently for optional auth
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

/**
 * Check if user has specific role
 */
const checkRole = (allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return sendError(res, 'Insufficient permissions', 403);
  }

  next();
};

/**
 * Check if user is same as target or is admin
 */
const checkOwnershipOrAdmin = (paramName = 'id') => (req, res, next) => {
  if (!req.user) {
    return sendError(res, 'Not authenticated', 401);
  }

  const targetId = req.params[paramName];

  if (req.user._id.toString() !== targetId && req.user.role !== 'admin') {
    return sendError(res, 'Access denied', 403);
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  checkRole,
  checkOwnershipOrAdmin,
};
