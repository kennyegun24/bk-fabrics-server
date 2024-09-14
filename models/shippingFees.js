const mongoose = require("mongoose");

const shippingFeeSchema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
      unique: true,
    },
    states: [
      {
        stateName: {
          type: String,
          required: true,
          unique: true,
        },
        fee: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShippingFees", shippingFeeSchema);
