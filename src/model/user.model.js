const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Default permissions based on role
const defaultPermissions = {
  admin: ["add", "view", "edit", "delete"],
  employee: ["add", "view", "edit", "delete"],
  job_seeker: ["add", "view"],
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "employee", "job_seeker"],
      default: "job_seeker",
    },
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    permissions: [
      {
        type: String,
        enum: ["add", "view", "edit", "delete"],
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// ------------------------
// Pre-save middleware
// ------------------------
userSchema.pre("save", async function () {
  // Hash password if modified
  if (this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  // Assign permissions based on role if new
  if (this.isNew) {
    this.permissions = defaultPermissions[this.role] || [];
  }

  // Check email uniqueness
  const isExist = await this.constructor.findOne({ email: this.email });
  if (isExist && isExist._id.toString() !== this._id.toString()) {
    throw new Error("Email already exists");
  }
});

// ------------------------
// Instance methods
// ------------------------

// Compare password
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESTOKEN_SECRET,
    { expiresIn: process.env.ACCESTOKEN_EXPIRE }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};

// Verify access token
userSchema.methods.verifyAccessToken = async function (token) {
  return jwt.verify(token, process.env.ACCESTOKEN_SECRET);
};

// Verify refresh token
userSchema.methods.verifyRefreshToken = async function (token) {
  return jwt.verify(token, process.env.REFRESH_SECRET);
};

module.exports = mongoose.model("User", userSchema);
