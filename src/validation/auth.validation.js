const Joi = require("joi");
const { CustomError } = require("../helpers/customError");

const roles = ["admin", "employee", "job_seeker"];
const permissions = ["add", "view", "edit", "delete"];

const UserCreateValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required().messages({
    "string.base": "Name must be a string.",
    "string.empty": "Name is required and cannot be empty.",
    "string.min": "Name must be at least {#limit} characters long.",
    "string.max": "Name must not be more than {#limit} characters long.",
    "any.required": "Name is required.",
  }),

  email: Joi.string().trim().email().required().messages({
    "string.base": "Email must be a string.",
    "string.email": "Please provide a valid email address.",
    "string.empty": "Email is required.",
    "any.required": "Email is required.",
  }),

  password: Joi.string()
    .trim()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#_\-])[A-Za-z\d@$!%*?&^#_\-]{8,}$/
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.",
      "any.required": "Password is required.",
    }),

  role: Joi.string()
    .valid(...roles)
    .default("job_seeker")
    .messages({
      "any.only": `Role must be one of: ${roles.join(", ")}.`,
    }),
}).unknown(true); // allow extra fields like timestamps etc.

exports.validateUserCreate = async (req) => {
  try {
    const value = await UserCreateValidationSchema.validateAsync(req.body, {
      abortEarly: false, // collect all errors
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
