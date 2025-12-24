const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const UserModel = require("../model/user.model");
const { validateUserCreate } = require("../validation/auth.validation");
const { CustomError } = require("../helpers/customError");
const jwt = require("jsonwebtoken");
const { forgetPassword } = require("../template/serverLiveTemplate");
const { mailer } = require("../helpers/nodeMailer");
const crypto = require("crypto");

// crerate user
exports.registration = asyncHandaler(async (req, res) => {
  const value = await validateUserCreate(req);

  // check if user already exists
  const userExists = await UserModel.findOne({ email: value.email });
  if (userExists) throw new CustomError(400, "User already exists");

  const userCreated = await new UserModel(value).save();
  if (!userCreated) throw new CustomError(400, "Registration failed");

  apiResponse.sendSucess(res, 201, "Registration successful", {
    name: userCreated.name,
    email: userCreated.email,
  });
});

// login user
exports.login = asyncHandaler(async (req, res) => {
  const { email, password } = req.body;

  // check if user exists
  const user = await UserModel.findOne({ email });
  if (!user) throw new CustomError(400, "Invalid email or password");

  // check if password is correct
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new CustomError(400, "Invalid email or password");

  const accesstoken = await user.generateAccessToken();
  if (!accesstoken) throw new CustomError(400, "Login failed");

  // save refresh token in database
  user.refreshToken = await user.generateRefreshToken();
  await user.save();

  // set refresh token in cookie
  res.cookie("AccessToken", accesstoken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 15 * 60 * 1000,
  });

  // set refresh token in cookie
  res.cookie("RefreshToken", user.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  apiResponse.sendSucess(res, 200, "Login successful", {
    name: user.name,
    accesstoken,
  });
});

// get single user
exports.getSingleUser = asyncHandaler(async (req, res) => {
  const id = req?.user?._id;

  const user = await UserModel.findById(id)
    .select("-password -forgetPasswordOtp -forgetPasswordExpires -refreshToken")
    .populate({
      path: "invitations",
      select: "title startsAt location host",
      populate: {
        path: "host",
        select: "name email",
      },
    });
  if (!user) throw new CustomError(404, "User not found");
  apiResponse.sendSucess(res, 200, "User found", user);
});

// update user
exports.updateUser = asyncHandaler(async (req, res) => {
  const { _id: id, role } = req?.user;
  const userid = req?.params?.userid;

  if (role == "admin") {
    if (!userid) throw new CustomError(400, "User id is required");
    const user = await UserModel.findByIdAndUpdate(userid, req.body, {
      new: true,
    });
    if (!user) throw new CustomError(404, "User not found");
    apiResponse.sendSucess(
      res,
      200,
      "User updated by admin successfully",
      user
    );
  }
  if (role == "user" && id !== userid) {
    if (id !== userid)
      throw new CustomError(
        403,
        "You do not have permission or not authorized to update this user."
      );
  }

  const user = await UserModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!user) throw new CustomError(404, "User not found");
  apiResponse.sendSucess(res, 200, "User updated successfully", user);
});

// change password
exports.changePassword = asyncHandaler(async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  // check if user exists
  const user = await UserModel.findOne({ email });
  if (!user) throw new CustomError(400, "User not found");

  // check if old password is correct
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new CustomError(400, "Invalid old password");

  // update password
  user.password = newPassword;
  await user.save();

  apiResponse.sendSucess(res, 200, "Password changed successfully");
});

// logout user
exports.logout = asyncHandaler(async (req, res) => {
  // bearer token authrization
  const refreshToken = req.headers.authorization?.replace("Bearer ", "");
  if (!refreshToken) throw new CustomError(400, "Invalid refresh token");

  // check if user exists
  const user = await UserModel.findOne({ refreshToken });
  if (!user) throw new CustomError(400, "Invalid refresh token");

  // delete refresh token from database
  user.refreshToken = null;
  await user.save();

  apiResponse.sendSucess(res, 200, "Logout successful");
});

// forget password
exports.forgetPassword = asyncHandaler(async (req, res) => {
  const { email } = req.body;

  // check if user exists
  const user = await UserModel.findOne({ email });
  if (!user) throw new CustomError(400, "User not found");

  const otp = crypto.randomInt(100000, 999999).toString();

  user.forgetPasswordOtp = otp;
  user.forgetPasswordExpires = Date.now() + 10 * 60 * 1000;

  // send forget password otp
  const template = forgetPassword(user.name, otp);
  const mailRes = await mailer("Reset password", template, user.email);
  if (!mailRes) throw new CustomError(400, "Mail sent failed");

  // save forget password otp in database
  await user.save();

  apiResponse.sendSucess(res, 200, "OTP sent successfully, check your email");
});

// veryfy forget password otp
exports.verifyForgetPasswordOtp = asyncHandaler(async (req, res) => {
  const { email, otp } = req.body;

  // check if user exists
  const user = await UserModel.findOne({ email });
  if (!user) throw new CustomError(404, "User not found");

  // check if otp is correct
  if (user.forgetPasswordOtp !== otp) throw new CustomError(401, "Invalid OTP");

  // check if otp is expired
  if (user.forgetPasswordExpires < Date.now())
    throw new CustomError(400, "OTP expired");

  apiResponse.sendSucess(res, 200, "OTP verified successfully");
});

// reset password
exports.resetPassword = asyncHandaler(async (req, res) => {
  const { email, password, otp } = req.body;

  // check if user exists
  const user = await UserModel.findOne({ email });
  if (!user) throw new CustomError(404, "User not found");

  // check if otp is correct
  if (user.forgetPasswordOtp !== otp) throw new CustomError(401, "Invalid OTP");

  // check if otp is expired
  if (user.forgetPasswordExpires < Date.now())
    throw new CustomError(400, "OTP expired");

  // hash password

  // update password
  user.password = password;
  user.forgetPasswordOtp = null;
  user.forgetPasswordExpires = null;
  await user.save();

  apiResponse.sendSucess(res, 200, "Password reset successfully");
});
