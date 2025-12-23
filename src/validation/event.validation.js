const Joi = require("joi");
const { CustomError } = require("../helpers/customError");
const { default: mongoose } = require("mongoose");

// =======================
// Joi Schema (Body)
// =======================
const EventValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(200).required().messages({
    "string.base": "Event name must be a string.",
    "string.empty": "Event name is required.",
    "string.min": "Event name must be at least {#limit} characters.",
    "string.max": "Event name must not exceed {#limit} characters.",
    "any.required": "Event name is required.",
  }),

  location: Joi.string().trim().min(3).required().messages({
    "string.base": "Location must be a string.",
    "string.empty": "Location is required.",
    "any.required": "Location is required.",
  }),

  date: Joi.date().iso().required().messages({
    "date.base": "Event date must be a valid date.",
    "any.required": "Event date is required.",
  }),

  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)\s-\s([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "Time must be in HH:mm format.",
      "any.required": "Event time is required.",
    }),

  capacity: Joi.number().integer().min(1).required().messages({
    "number.base": "Capacity must be a number.",
    "number.min": "Capacity must be at least 1.",
    "any.required": "Capacity is required.",
  }),
  createdBy: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("createdBy must be a valid user ID.");
      }
      return value;
    })
    .messages({
      "any.required": "createdBy user ID is required.",
      "string.base": "createdBy must be a string.",
    }),
});

// =======================
// Validation Function
// =======================
exports.validateEventCreate = async (req) => {
  try {
    // 1️⃣ Validate body
    const value = await EventValidationSchema.validateAsync(req.body, {
      abortEarly: false,
    });

    // 2️⃣ Image validation
    let images = req?.files?.image;

    if (!images) {
      throw new CustomError(400, "At least one event image is required.");
    }

    if (!Array.isArray(images)) {
      images = [images];
    }

    const allowedFormats = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB

    images.forEach((image) => {
      if (!allowedFormats.includes(image.mimetype)) {
        throw new CustomError(
          400,
          "Invalid image format. Allowed: jpg, jpeg, png, webp."
        );
      }

      if (image.size > MAX_SIZE) {
        throw new CustomError(400, "Image size must be below 3MB.");
      }
    });

    return {
      value,
      images,
    };
  } catch (error) {
    if (error.isJoi) {
      const messages = error.details.map((err) => err.message).join(", ");
      throw new CustomError(400, messages);
    }

    throw new CustomError(
      error.statusCode || 400,
      error.message || "Event validation failed"
    );
  }
};
