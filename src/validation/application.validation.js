const Joi = require("joi");
const { CustomError } = require("../helpers/customError");

const allowedCVFormats = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_CV_SIZE = 5 * 1024 * 1024;

const ApplicationCreateValidationSchema = Joi.object({
  jobId: Joi.string().required(),
  userId: Joi.string().optional(),
  status: Joi.string()
    .valid("pending", "accepted", "rejected")
    .default("pending"),
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed")
    .default("pending"),
  invoice: Joi.string().optional(),
}).unknown(true);

// validateApplication
exports.validateApplication = async (req) => {
  try {
    const value = await ApplicationCreateValidationSchema.validateAsync(
      req.body
    );
    const allowedCVFormats = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    // 2. CV File validation (like your product validation)
    const cv = req?.files?.cv[0];

    if (!cv) {
      throw new CustomError(401, "CV file is required");
    }

    // Must be single file
    if (req?.files?.cv?.length > 1) {
      throw new CustomError(401, "Only one CV file is allowed");
    }

    // Max size check (5MB)
    if (cv.size > MAX_CV_SIZE) {
      throw new CustomError(401, "CV size must be below 5MB");
    }

    if (!allowedCVFormats.includes(cv.mimetype)) {
      throw new CustomError(
        401,
        "Invalid CV format. Only PDF, DOC, and DOCX are allowed"
      );
    }

    return {
      value,
      cv: req?.files?.cv,
    };
  } catch (error) {
    throw new CustomError(401, error.message || error);
  }
};
