const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    cvUrl: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice"
    }
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
