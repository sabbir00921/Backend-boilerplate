// src/validations/quickRally.validation.js
const Joi = require("joi");
const { CustomError } = require("../helpers/customError");

// =======================
// Joi Schema
// =======================
const QuickRallyCreateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),

  description: Joi.string().trim().max(500).optional(),

  latitude: Joi.number().required(),

  longitude: Joi.number().required(),

  locationName: Joi.string().trim().max(200).optional(),
}).options({ allowUnknown: false });

// =======================
// Validation Function
// =======================
exports.validateQuickRallyCreate = async (req) => {
  try {
    const value = await QuickRallyCreateSchema.validateAsync(req.body, {
      abortEarly: false,
    });

    return value;
  } catch (error) {
    if (error.isJoi) {
      const messages = error.details.map((e) => e.message).join(", ");
      throw new CustomError(400, messages);
    }

    throw new CustomError(
      error.statusCode || 400,
      error.message || "Quick Rally validation failed"
    );
  }
};
