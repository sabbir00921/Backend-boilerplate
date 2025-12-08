const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cvAssets: {},

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    transId: { type: String },

    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },
  },
  { timestamps: true }
);

// ⭐ prevent duplicate application
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
