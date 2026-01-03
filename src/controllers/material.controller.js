const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler');
const { createMaterialSchema, updateMaterialSchema } = require('../utils/validation');
const materialService = require('../services/materialService');

/**
 * Create material
 */
const createMaterial = asyncHandler(async (req, res) => {
  const validatedData = createMaterialSchema.parse(req.body);

  // In production, handle file upload separately
  const material = await materialService.createMaterial(
    req.params.courseId,
    req.user._id,
    {
      ...validatedData,
      fileUrl: req.body.fileUrl || '/uploads/default',
    }
  );

  sendSuccess(res, material, 'Material created successfully', 201);
});

/**
 * Get course materials
 */
const getCourseMaterials = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const result = await materialService.getCourseMaterials(req.params.courseId, page, limit);

  sendSuccess(res, result, 'Materials retrieved successfully');
});

/**
 * Get material by ID
 */
const getMaterialById = asyncHandler(async (req, res) => {
  const material = await materialService.getMaterialById(req.params.materialId);
  sendSuccess(res, material, 'Material retrieved successfully');
});

/**
 * Update material
 */
const updateMaterial = asyncHandler(async (req, res) => {
  const validatedData = updateMaterialSchema.parse(req.body);
  const material = await materialService.updateMaterial(req.params.materialId, validatedData);

  sendSuccess(res, material, 'Material updated successfully');
});

/**
 * Delete material
 */
const deleteMaterial = asyncHandler(async (req, res) => {
  const result = await materialService.deleteMaterial(req.params.materialId);
  sendSuccess(res, result, 'Material deleted successfully');
});

/**
 * Download material
 */
const downloadMaterial = asyncHandler(async (req, res) => {
  const material = await materialService.recordDownload(req.params.materialId, req.user._id);
  sendSuccess(res, { downloadUrl: material.fileUrl }, 'Download link generated');
});

module.exports = {
  createMaterial,
  getCourseMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  downloadMaterial,
};
