const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
    forgetPasswordOtp: {
      type: String,
    },
    forgetPasswordExpires: {
      type: Date,
    },
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

  // Check email uniqueness
  const isExist = await this.constructor.findOne({ email: this.email });
  if (isExist && isExist._id.toString() !== this._id.toString()) {
    throw new Error("Email already exists");
  }
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  if (!password) return false;
  return bcrypt.compare(password, this.password);
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
    {
      expiresIn: process.env.ACCESTOKEN_EXPIRE,
    }
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
