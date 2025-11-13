const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');

/**
 * Verify JWT token
 */
const verifyJWT = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};

/**
 * Sign JWT token
 */
const signToken = (payload, expiresIn = process.env.JWT_EXPIRE) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Verify API key
 */
const verifyApiKey = async (key) => {
  try {
    const apiKey = await ApiKey.verifyKey(key);
    if (!apiKey) {
      return null;
    }
    return apiKey;
  } catch (error) {
    throw new Error(`Invalid API key: ${error.message}`);
  }
};

module.exports = {
  verifyJWT,
  signToken,
  verifyApiKey,
};
