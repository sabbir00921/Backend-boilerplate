const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const BarHopModel = require("../model/barhop.model");

const { CustomError } = require("../helpers/customError");

const {
  uploadImageCloudinary,
  deleteImageCloudinary,
} = require("../helpers/cloudinary");

// create barhop
exports.createBarhop = asyncHandaler(async (req, res) => {
  const value = req.body;
  const barhop = await new BarHopModel(value).save();
  apiResponse.sendSucess(res, 201, "Barhop created successfully");
});
