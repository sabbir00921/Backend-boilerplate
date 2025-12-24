const jwt = require("jsonwebtoken");
require("dotenv").config();
const userModel = require("../model/user.model");
const { CustomError } = require("../helpers/customError");

const authGuard = async (req, res, next) => {
  const accesstoken = req?.cookies?.AccessToken || req?.headers?.accesstoken;
  console.log(accesstoken);

  if (!accesstoken) throw new CustomError(401, "Unauthorized access!");

  // verify token
  const decode = jwt.verify(accesstoken, process.env.ACCESTOKEN_SECRET);
  const user = await userModel.findById({ _id: decode.id });
  if (!user) throw new CustomError(401, "Unauthorized access!");

  req.user = user;
  next();
};

module.exports = { authGuard };
