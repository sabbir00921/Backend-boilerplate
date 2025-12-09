const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const UserModel = require("../model/user.model");
const { validateUserCreate } = require("../validation/auth.validation");
const { CustomError } = require("../helpers/customError");
const jwt = require("jsonwebtoken");

// crerate user
exports.registration = asyncHandaler(async (req, res) => {
  const value = await validateUserCreate(req);

  // check if user already exists
  const userExists = await UserModel.findOne({ email: value.email });
  if (userExists) throw new CustomError(400, "User already exists");

  const userCreated = await new UserModel(value).save();
  if (!userCreated) throw new CustomError(400, "Registration failed");

  apiResponse.sendSucess(res, 201, "Registration successful", userCreated);
});

// getall user
exports.getAllUser = asyncHandaler(async (req, res) => {
  // extract query parameters
  const { accountStatus } = req.query;
  const filter = {};
  if (accountStatus) filter.accountStatus = accountStatus;

  // fetch users based on filter
  const users = await UserModel.find(filter).select("-password");
  if (users.length === 0) throw new CustomError(404, "No users found");

  apiResponse.sendSucess(res, 200, "User list fetched", users);
});

// update user
exports.updateUser = asyncHandaler(async (req, res) => {
  const id = req.params.id;

  // check duplicate email
  if (req?.body?.email) {
    const emailExists = await UserModel.findOne({ email: req.body.email });

    if (emailExists && emailExists._id.toString() !== id)
      throw new CustomError(400, "Email already exists for another user");
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: id },
    { $set: req.body },
    { new: true, runValidators: true }
  ).select("role name email accountStatus permissions");
  if (!user) throw new CustomError(404, "User not found");
  apiResponse.sendSucess(res, 200, "User updated", user);
});

// delete user
exports.deleteUser = asyncHandaler(async (req, res) => {
  const id = req.params.id;
  const user = await UserModel.findOneAndDelete({ _id: id }).select(
    "-password -__v -refreshtoken"
  );
  if (!user) throw new CustomError(404, "User not found");
  apiResponse.sendSucess(res, 200, "User deleted", user);
});

// login user
exports.login = asyncHandaler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new CustomError(400, "Email and password required");

  const user = await UserModel.findOne({ email });
  if (!user) throw new CustomError(400, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new CustomError(400, "Invalid email or password");

  const accessToken = await user.generateAccessToken();
  if (!accessToken)
    throw new CustomError(400, "access token generation failed");

  const refreshToken = await user.generateRefreshToken();
  if (!refreshToken)
    throw new CustomError(400, "refresh token generation failed");

  res.cookie("RefreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: "Strict",
    path: "/",
    maxAge: 15 * 24 * 60 * 60 * 1000,
  });

  res.cookie("AccessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: "Strict",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  // set refresh token into db
  user.refreshToken = refreshToken;
  await user.save();

  apiResponse.sendSucess(res, 200, "Login successful", {
    user: user.name,
    accessToken,
  });
});

// logout user
exports.logout = asyncHandaler(async (req, res) => {
  const accessToken = req?.cookies?.AccessToken;
  if (!accessToken) throw new CustomError(400, "Access token not found");

  const decode = jwt.verify(accessToken, process.env.ACCESTOKEN_SECRET);
  if (!decode) throw new CustomError(400, "Invalid access token");

  const user = await UserModel.findOne({ _id: decode.id });
  if (!user) throw new CustomError(400, "User not found");

  user.refreshToken = null;
  await user.save();

  res.clearCookie("RefreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: "Strict",
    path: "/",
  });
  res.clearCookie("AccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development" ? false : true,
    sameSite: "Strict",
    path: "/",
  });
  apiResponse.sendSucess(res, 200, "Logout successful");
});

// regenerate accesstoken using refreshtoken
exports.regenerateAccessToken = asyncHandaler(async (req, res) => {
  const refreshToken = req.cookies.RefreshToken;
  if (!refreshToken) throw new CustomError(400, "Refresh token not found");

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
  if (!decoded) throw new CustomError(400, "Invalid refresh token or expired");
  const userId = decoded.id;

  const user = await UserModel.findOne({ _id: userId });
  if (!user) throw new CustomError(404, "User not found");

  const accessToken = await user.generateAccessToken();
  if (!accessToken)
    throw new CustomError(400, "access token generation failed");
  apiResponse.sendSucess(res, 200, "Access token regenerated", {accessToken});
});
