// src/models/Event.js
const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rsvp: {
      type: String,
      enum: ["yes", "maybe", "no"],
      default: "yes",
    },

    presenceStatus: {
      type: String,
      enum: ["joined", "home_safe", "still_out", "en_route"],
      default: "joined",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const stopSchema = new mongoose.Schema(
  {
    name: String,
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startsAt: Date,

    location: String,
    image: {
      public_id: String,
      secure_url: String,
    },

    isQuickRally: {
      type: Boolean,
      default: false,
    },
    fee: {
      type: Number,
      default: 0,
    },
    capacity: {
      type: Number,
      default: 0,
    },
    invitations: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
          type: String,
          enum: ["pending", "accepted", "declined"],
          default: "pending",
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false,
      },
    ],
    participants: [participantSchema],

    rallyStops: [stopSchema],

    currentStopIndex: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
