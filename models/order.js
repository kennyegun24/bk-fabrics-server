const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, default: "Pending" },
    products: [
      {
        product_name: { type: String, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("products", orderSchema);
