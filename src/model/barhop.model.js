// src/models/BarHopping.js
const mongoose = require("mongoose");

const BarHoppingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    fee: {
      type: Number,
      default: 0,
      min: 0,
    },

    image: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BarHopping", BarHoppingSchema);
