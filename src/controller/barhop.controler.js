const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const BarHopModel = require("../model/barhop.model");

const { CustomError } = require("../helpers/customError");

const {
  uploadImageCloudinary,
  deleteImageCloudinary,
} = require("../helpers/cloudinary");
const { validateBarHop } = require("../validation/barhop.validation");

// create barhop
exports.createBarhop = asyncHandaler(async (req, res) => {
  const { value, image } = await validateBarHop(req);

  const barhop = await new BarHopModel({
    ...value,
    createdBy: req?.user?._id,
  }).save();
  if (!barhop) throw new CustomError(400, "Barhop creation failed");

  // Upload image to cloudinary
  if (image) {
    const response = await uploadImageCloudinary(image.path);
    barhop.image = response;
  }

  await barhop.save();
  apiResponse.sendSucess(res, 201, "Barhop created successfully", barhop);
});

// get all barhops
exports.getAllBarhops = asyncHandaler(async (req, res) => {
  if (req.user.role === "admin") {
    const barhop = await BarHopModel.find({}).sort({ createdAt: -1 });
    if (!barhop || barhop.length === 0) {
      throw new CustomError(404, "Barhops not found");
    }
    apiResponse.sendSucess(
      res,
      200,
      "All Barhops fetched successfully",
      barhop
    );
  } else {
    const barhop = await BarHopModel.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    if (!barhop || barhop.length === 0) {
      throw new CustomError(404, "Barhops not found");
    }
    apiResponse.sendSucess(
      res,
      200,
      "Own Barhops fetched successfully",
      barhop
    );
  }
});

// get single barhop
exports.getSingleBarhop = asyncHandaler(async (req, res) => {
  const { id } = req.params;
  const barhop = await BarHopModel.findById(id);
  if (!barhop) throw new CustomError(404, "Barhop not found");
  apiResponse.sendSucess(res, 200, "Barhop fetched successfully", barhop);
});
