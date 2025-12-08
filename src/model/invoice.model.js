const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Invoice", invoiceSchema);
