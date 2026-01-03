const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler.js');
const resultService = require('../services/resultService');

/**
 * Create result (Admin only)
 */
const createResult = asyncHandler(async (req, res) => {
  const validatedData = createResultSchema.parse(req.body);
  const result = await resultService.createResult(validatedData);

  sendSuccess(res, result, 'Result created successfully', 201);
});

/**
 * Publish results
 */
const publishResults = asyncHandler(async (req, res) => {
  const { resultIds } = req.body;

  if (!Array.isArray(resultIds) || resultIds.length === 0) {
    return sendSuccess(res, {}, 'No results to publish', 400);
  }

  await resultService.publishResults(resultIds, req.user._id);
  sendSuccess(res, {}, 'Results published successfully');
});

/**
 * Get results
 */
const getResults = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await resultService.getResults(req.user._id, req.user.role, { page, limit });

  sendSuccess(res, result, 'Results retrieved successfully');
});

/**
 * Get student results
 */
const getStudentResults = asyncHandler(async (req, res) => {
  const results = await resultService.getStudentResults(
    req.params.studentId,
    req.user._id,
    req.user.role
  );

  sendSuccess(res, results, 'Student results retrieved successfully');
});

/**
 * Update result
 */
const updateResult = asyncHandler(async (req, res) => {
  const validatedData = updateResultSchema.parse(req.body);
  const result = await resultService.updateResult(req.params.id, validatedData);

  sendSuccess(res, result, 'Result updated successfully');
});

/**
 * Delete result
 */
const deleteResult = asyncHandler(async (req, res) => {
  const result = await resultService.deleteResult(req.params.id);
  sendSuccess(res, result, 'Result deleted successfully');
});

module.exports = {
  createResult,
  publishResults,
  getResults,
  getStudentResults,
  updateResult,
  deleteResult,
};
