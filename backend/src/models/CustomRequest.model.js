const mongoose = require("mongoose");

const CustomRequestSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    productType: { type: String },
    customDetails: { type: String },
    contactMethod: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CustomRequest", CustomRequestSchema);

