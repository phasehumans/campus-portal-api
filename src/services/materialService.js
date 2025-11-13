const Material = require('../models/Material');

/**
 * Create material
 */
const createMaterial = async (courseId, uploaderId, data) => {
  const { title, description, type, fileName, fileSize, fileUrl, dueDate } = data;

  const material = new Material({
    course: courseId,
    title,
    description,
    type,
    fileName,
    fileSize,
    fileUrl,
    uploader: uploaderId,
    dueDate: dueDate || null,
  });

  await material.save();
  await material.populate('uploader', 'firstName lastName email');

  return material;
};

/**
 * Get materials for course
 */
const getCourseMaterials = async (courseId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const materials = await Material.find({
    course: courseId,
    isPublished: true,
  })
    .populate('uploader', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Material.countDocuments({
    course: courseId,
    isPublished: true,
  });

  return {
    materials,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
};

/**
 * Get material by ID
 */
const getMaterialById = async (materialId) => {
  const material = await Material.findById(materialId).populate(
    'uploader',
    'firstName lastName email'
  );

  if (!material) {
    throw new Error('Material not found');
  }

  return material;
};

/**
 * Update material
 */
const updateMaterial = async (materialId, data) => {
  const allowedFields = ['title', 'description', 'type', 'dueDate', 'isPublished'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const material = await Material.findByIdAndUpdate(
    materialId,
    { ...updateData, updatedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!material) {
    throw new Error('Material not found');
  }

  return material;
};

/**
 * Delete material
 */
const deleteMaterial = async (materialId) => {
  const material = await Material.findByIdAndDelete(materialId);

  if (!material) {
    throw new Error('Material not found');
  }

  return { message: 'Material deleted successfully' };
};

/**
 * Record material download
 */
const recordDownload = async (materialId, userId) => {
  const material = await Material.findByIdAndUpdate(
    materialId,
    {
      $push: {
        downloads: {
          user: userId,
          downloadedAt: new Date(),
        },
      },
    },
    { new: true }
  );

  if (!material) {
    throw new Error('Material not found');
  }

  return material;
};

module.exports = {
  createMaterial,
  getCourseMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  recordDownload,
};
