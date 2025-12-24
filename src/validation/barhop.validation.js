const Joi = require("joi");
const { CustomError } = require("../helpers/customError");

// =======================
// Joi Schema
// =======================
const BarHoppingCreateValidationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),

  description: Joi.string().trim().max(1000).required(),

  location: Joi.string().trim().max(500).required(),

  fee: Joi.number().min(0).max(100000).precision(2).optional(),
}).options({ allowUnknown: false });

// =======================
// Validation Function
// =======================
exports.validateBarHop = async (req) => {
  try {
    // 1️⃣ Validate body
    const value = await BarHoppingCreateValidationSchema.validateAsync(
      req.body,
      {
        abortEarly: false,
      }
    );

    // 2️⃣ Validate single image
    const image = req.file; // optional single image

    if (!image) {
      return { value };
    }

    const allowedFormats = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB

    if (!allowedFormats.includes(image.mimetype)) {
      throw new CustomError(
        400,
        "Invalid image format. Allowed: jpg, jpeg, png, webp"
      );
    }

    if (image.size > MAX_SIZE) {
      throw new CustomError(400, "Image size must be below 3MB");
    }

    return {
      value,
      image,
    };
  } catch (error) {
    if (error.isJoi) {
      const messages = error.details.map((err) => err.message).join(", ");
      throw new CustomError(400, messages);
    }

    throw new CustomError(
      error.statusCode || 400,
      error.message || "Bar hopping validation failed"
    );
  }
};
