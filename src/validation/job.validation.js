const Joi = require("joi");
const { CustomError } = require("../helpers/customError");

const JobCreateValidationSchema = Joi.object({
  title: Joi.string().trim().min(3).max(100).required().messages({
    "string.base": "Title must be a string.",
    "string.empty": "Title is required.",
    "string.min": "Title must be at least {#limit} characters long.",
    "string.max": "Title must not be more than {#limit} characters long.",
    "any.required": "Job title is required.",
  }),

  description: Joi.string().trim().min(5).max(1000).optional().messages({
    "string.base": "Description must be a string.",
    "string.min": "Description must be at least {#limit} characters long.",
    "string.max": "Description must not be more than {#limit} characters long.",
  }),

  company: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "Company must be a string.",
    "string.min": "Company name must be at least {#limit} characters long.",
    "string.max":
      "Company name must not be more than {#limit} characters long.",
  }),

  location: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "Location must be a string.",
    "string.min": "Location must be at least {#limit} characters long.",
    "string.max": "Location must not be more than {#limit} characters long.",
  }),

  salaryRange: Joi.string().trim().max(100).optional().messages({
    "string.base": "Salary range must be a string.",
    "string.max":
      "Salary range must not be more than {#limit} characters long.",
  }),
}).unknown(true);

exports.validateJobCreate = async (req) => {
  try {
    const value = await JobCreateValidationSchema.validateAsync(req.body, {
      abortEarly: false,
    });
    return value;
  } catch (error) {
    if (error.details) {
      const messages = error.details.map((err) => err.message).join(", ");
      throw new CustomError(400, messages);
    }
    throw new CustomError(400, error.message || "Validation failed");
  }
};


