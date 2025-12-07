const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application"
  },

  providerId: {
    type: String, // mock_123456
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);
