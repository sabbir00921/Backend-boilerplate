// src/models/RallyMessage.js
const mongoose = require("mongoose");

const RallyMessageSchema = new mongoose.Schema(
  {
    rally: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuickRally",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    message: {
      type: String,
      trim: true,
      required: true,
      maxlength: 1000,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RallyMessage", RallyMessageSchema);
