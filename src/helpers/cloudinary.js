require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { CustomError } = require("./customError");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECREAT,
});

// Upload CV to Cloudinary
exports.uploadImageCloudinary = async (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new CustomError(401, "CV file path missing");
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder: "Scale/images",
    });

    // Delete file from local server
    if (cloudinaryResponse) {
      fs.unlinkSync(filePath);
    }

    return {
      public_id: cloudinaryResponse.public_id,
      secure_url: cloudinaryResponse.secure_url,
    };
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw new CustomError(
      500,
      "Failed to upload Image file: " + (error.message || error)
    );
  }
};

// Delete CV from Cloudinary
exports.deleteImageCloudinary = async (public_id) => {
  try {
    const response = await cloudinary.uploader.destroy(public_id, {
      resource_type: "image",
    });

    return response;
  } catch (error) {
    throw new CustomError(
      500,
      "Failed to delete CV from server: " + (error.message || error)
    );
  }
};
