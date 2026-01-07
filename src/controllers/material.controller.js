const { success } = require('zod/v4');
const { asyncHandler, sendSuccess, getPaginationParams } = require('../utils/responseHandler.js');
const {z} = require('zod')
const {MaterialModel} = require('../models/material.model.js')


const createMaterial = asyncHandler(async (req, res) => {
  const createMaterialSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(['lecture', 'assignment', 'reading', 'video', 'document', 'other']),
    fileName: z.string().min(1, 'File name is required'),
    fileSize: z.number().min(1),
    dueDate: z.string().datetime().optional().or(z.null()),
  });

  const parseData = createMaterialSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const {title, description, type, fileName, fileSize, dueDate} = parseData.data
  const uploadedBy = req.id
  const courseId = req.params.courseId
  const fileUrl = req.body.fileUrl || "/uploads/default";

  try {
    const material = await MaterialModel.create({
      course : courseId,
      title : title,
      description : description,
      fileType : type,
      fileName : fileName,
      fileUrl : fileUrl,
      fileSize : fileSize,
      uploadedBy : uploadedBy,
      dueDate : dueDate
    })
  
    return res.status(201).json({
      success: true,
      message: "Material created successfully",
      material : material
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }

});

const getCourseMaterials = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const skip = (page - 1) * limit;
  const courseId = req.params.courseId

  try {
    const material = await MaterialModel.find({
      course: courseId,
      isPublished: true,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  
    const total = await MaterialModel.countDocuments({
      course : courseId,
      isPublished : true
    })
  
    return res.status(200).json({
      success: true,
      message: "Materials retrieved successfully",
      material : material,
      pagination : {
        total : total,
        pages : Math.ceil(total/limit),
        currentPage : page,
        limit : limit
      }
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const getMaterialById = asyncHandler(async (req, res) => {
  const courseId = req.params.courseId
  const materialId = req.params.materialId

  try {
    const material = await MaterialModel.findOne({
      course : courseId,
      _id : materialId
    })
  
    if(!material){
      return res.status(400).json({
        success : false,
        message : "material not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Material retrieved successfully",
      material : material
    });
  
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const updateMaterial = asyncHandler(async (req, res) => {
  const updateMaterialSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    type: z.enum([
      "lecture",
      "assignment",
      "reading",
      "video",
      "document",
      "other",
    ]).optional(),
    fileName: z.string().min(1, "File name is required").optional(),
    fileSize: z.number().min(1).optional(),
    dueDate: z.string().datetime().optional().or(z.null()),
  });

  const parseData = updateMaterialSchema.safeParse(req.body)

  if(!parseData.success){
    return res.status(400).json({
      success : false,
      message : "invalid inputs",
      errors : parseData.error.flatten()
    })
  }

  const {title, description, type, fileName, fileSize, dueDate} = parseData.data
  const materialId = req.params.materialId
  const fileUrl = req.body.fileUrl || "/uploads/default";

  try {
    const material = await MaterialModel.findByIdAndUpdate(
      materialId,
      {
        title : title,
        description : description,
        type : type,
        fileName : fileName,
        fileUrl : fileUrl,
        fileSize : fileSize,
        dueDate : dueDate,
        updatedAt : new Date()
      },{
        new : true,
        runValidators : true
      }
    )
  
    if(!material){
      return res.status(400).json({
        success : false,
        message : "material not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Material updated successfully",
      material : material
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }

});

const deleteMaterial = asyncHandler(async (req, res) => {
  const materialId = req.params.materialId

  try {
    const material = await MaterialModel.findByIdAndDelete(materialId)
  
    if(!material){
      return res.status(400).json({
        success : false,
        message : "material not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success : false,
      message : "server error",
      errors : error.message
    })
  }
});

const downloadMaterial = asyncHandler(async (req, res) => {
  const materialId = req.params.materialId;
  const userId = req.id

  try {
    const material = await MaterialModel.findByIdAndUpdate(
      materialId,
      {
        $push : {
          downloadedBy : {
            user : userId,
            downloadedAt : new Date()
          }
        }
      },
      {
        new : true
      }
    )
  
    if(!material){
      return res.status(400).json({
        success : false,
        message : "material not found"
      })
    }
  
    return res.status(200).json({
      success: true,
      message: "Download link generated",
      downloadLink : material.fileUrl
    });

  } catch (error) {
    return res.status(500).json({
      success : true,
      message : "server error",
      errors : error.message
    })
  }
});

module.exports = {
  createMaterial : createMaterial,
  getCourseMaterials : getCourseMaterials,
  getMaterialById : getMaterialById,
  updateMaterial : updateMaterial,
  deleteMaterial : deleteMaterial,
  downloadMaterial : downloadMaterial,
};
