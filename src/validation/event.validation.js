const Joi = require("joi");
const mongoose = require("mongoose");
const { CustomError } = require("../helpers/customError");

// =======================
// Joi Schema
// =======================
const EventCreateValidationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),

  description: Joi.string().trim().max(1000).required(),

  // host: Joi.string()
  //   .required()
  //   .custom((value, helpers) => {
  //     if (!mongoose.Types.ObjectId.isValid(value)) {
  //       return helpers.message("host must be a valid user id");
  //     }
  //     return value;
  //   }),

  startsAt: Joi.date().iso().optional(),

  location: Joi.string().trim().max(1000).required(),

  isQuickRally: Joi.boolean().optional(),

  fee: Joi.number().min(0).max(100000).precision(2).optional(),

  capacity: Joi.number().min(0).max(200).optional(),

  participants: Joi.array()
    .items(
      Joi.object({
        user: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              return helpers.message(
                "participant user must be a valid user id"
              );
            }
            return value;
          }),
      })
    )
    .optional(),

  invitations: Joi.array()
    .items(
      Joi.string()
        .required()
        .custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.message("Each invitation must be a valid user id");
          }
          return value;
        })
    )
    .optional(),

  rallyStops: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().min(2).optional(),
      })
    )
    .optional(),
}).options({ allowUnknown: false });

// =======================
// Validation Function
// =======================
exports.validateEventCreate = async (req) => {
  try {
    // 1️⃣ Validate body
    const value = await EventCreateValidationSchema.validateAsync(req.body, {
      abortEarly: false,
    });

    // 2️⃣ Validate single image
    const image = req.file; // ✅ single file

    if (!image) {
      return {
        value,
      };
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
      error.message || "Event validation failed"
    );
  }
};
