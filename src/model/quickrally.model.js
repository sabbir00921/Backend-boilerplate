// src/models/QuickRally.js
const mongoose = require("mongoose");

const QuickRallySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Quick Rally",
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      name: { type: String },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },

    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],

    chatEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuickRally", QuickRallySchema);
